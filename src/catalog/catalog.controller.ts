import { Body, Controller, Delete, Get, Param, ParseArrayPipe, Post, Put, Query, Req, Res } from "@nestjs/common";
import { CatalogService } from "./catalog.service";
import { UserService } from "../user/user.service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/models/user.entity";
import { CatalogFilterDto } from "./dtos/catalog-filter.dto";
import { CatalogCreateDto } from "./dtos/catalog-create.dto";
import { CatalogResponseDto } from "./dtos/catalog-response.dto";
import { CatalogUpdateDto } from "./dtos/catalog-update.dto";

@Controller("catalog")
export class CatalogController {
    constructor(
        private catalogService: CatalogService,
        private jwtService: JwtService,
        private userService: UserService
    ) {
    }

    @Get()
    async getCatalog(
        @Query() filters: any,
        @Res({ passthrough: true }) res: Response
    ) {
        const items = await this.catalogService.all();

        if (!filters || (typeof filters === "object" && Object.keys(filters).length === 0)) {
            // If no filters provided, return all items
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "All objects from catalog",
                data: items
            };
        }

        // TODO : Make a better and coherent response here
        // Filter the catalog items based on the provided filters
        return items.filter(item => {
            console.log(item);
            let i = true;
            for (const key in filters) {
                console.log("Comp : ", item[key], " and ", filters[key]);
                if (item[key] == undefined) return false;
                if (item[key].toString() !== filters[key]) {
                    console.log(
                        "comp : ",
                        item[key].toString(),
                        " : ",
                        filters[key]
                    );
                    i = false; // Item doesn't match the filter condition
                }
            }
            return i; // All filter conditions passed, include the item
        });
    }

    @Get("company/:company_id")
    async getCompanyCatalog(
        @Req() req: Request,
        @Param("company_id") company_id: number,
        @Res({ passthrough: true }) res: Response
    ): Promise<{
        status: string;
        code: number;
        description: string;
        data: null | CatalogResponseDto[];
    }> {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            };
        }

        const user = await this.userService.findOne({ id: data["id"] });

        if (!user) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description:
                    "Your user doesn't exists ant can't access this resource",
                data: null
            };
        }

        const company = user.id === company_id ? user : await this.userService.findOne({ id: company_id });

        if (!company || company.role !== "company") {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Company not found",
                data: null
            };
        }

        const items = await this.catalogService.findByCompany(company_id);
        const activeItems = items.filter(item => {
            if (!item.active) {
                return (item.company === user.id) || (user.role === "admin");
            }
            return true;
        });

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: `All available objects from catalog for company ${company.id} (${company.first_name} ${company.last_name})`,
            data: activeItems
        };
    }

    @Post(":id/add")
    /*
    L’intégralité des meubles seront vérifiés avant de les ajouter en base de données. Si un meuble est invalide, rien ne sera inscrit en base de données et une erreur sera retournée à l’utilisateur
    Si la requête aboutit, un code HTTP 201 sera renvoyé ainsi que les meubles et leurs propriétés dans un tableau d’objets JSON
    */
    async add(
        @Req() req: Request,
        @Param("id") id: number,
        @Body(new ParseArrayPipe({ items: CatalogCreateDto })) catalog: CatalogCreateDto[],
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(req, res, id);
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        const company = authorizedCompany.id === id ? authorizedCompany : await this.userService.findOne({ id: id });

        if (!company) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Company not found",
                data: null
            };
        }

        if (company.role !== "company") {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "User is not a company",
                data: null
            };
        }

        if (!(catalog instanceof Array) || catalog.length === 0) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "No object to register",
                data: null
            };
        }

        const errors = [];

        // Check errors of each object
        for (let i = 0; i < catalog.length; i++) {
            const isValid = this.checkObject(company, catalog[i], i);
            if (isValid.length > 0) {
                errors.push(isValid);
            }
        }

        // If there are errors, return them and don't register any object in database
        if (errors.length > 0) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: errors,
                data: null
            };
        }

        // If there are no errors, register each object in database
        for (let i = 0; i < catalog.length; i++) {
            await this.catalogService.create(catalog[i]).catch(err => {
                console.error(err);
                res.status(500);
                return {
                    status: "KO",
                    code: 500,
                    description: "Internal server error",
                    data: null
                };
            });
        }

        res.status(201);
        return {
            status: "OK",
            code: 201,
            description: "Objects registered",
            data: catalog
        };
    }

    @Put(":company_id/edit/:object_id")
    async update(
        @Req() req: Request,
        @Param("company_id") company_id: number,
        @Param("object_id") object_id: string,
        @Body() catalog: CatalogUpdateDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(
            req,
            res,
            company_id
        );
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        const company = authorizedCompany.id === company_id ? authorizedCompany : await this.userService.findOne({ id: company_id });

        const object = await this.catalogService.findOne({
            object_id: object_id,
            company: company_id
        });

        if (object === null) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Object doesn't exist in the catalog",
                data: null
            };
        }

        const errors = this.checkObject(company, catalog);
        if (errors.length > 0) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Object not updated",
                data: errors
            };
        }

        const updatedObject = await this.catalogService.update(object, catalog);
        if (updatedObject === null) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Object not updated",
                data: null
            };
        }


        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Object updated",
            data: updatedObject
        };
    }

    @Delete([":company_id/removeAll", ":company_id/archiveAll"])
    async removeAll(
        @Req() req: Request,
        @Param("company_id") company_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(req, res, company_id);
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        const removedObjects = await this.catalogService.archiveAllForCompany(company_id);
        if (removedObjects === null) {
            res.status(500);
            return {
                status: "KO",
                code: 500,
                description: "Some objects have not been removed due to a server error",
                data: null
            };
        }

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Objects removed",
            data: removedObjects
        };
    }

    @Delete([":company_id/remove/:object_id", ":company_id/archive/:object_id"])
    async removeOne(
        @Req() req: Request,
        @Param("company_id") company_id: number,
        @Param("object_id") object_id: string,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(req, res, company_id);
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        const object = await this.catalogService.findOne({
            object_id: object_id,
            company: company_id
        });

        if (object === null) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Object doesn't exists in catalog",
                data: null
            };
        }

        const removedObject = await this.catalogService.archive(object.id);
        if (removedObject === null) {
            res.status(500);
            return {
                status: "KO",
                code: 500,
                description: "Object has not been removed due to a server error",
                data: null
            };
        } else {
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "Object successfully removed from catalog",
                data: removedObject
            };
        }
    }

    @Delete([":company_id/remove", ":company_id/archive"])
    async remove(
        @Req() req: Request,
        @Param("company_id") company_id: number,
        @Body() objects: string[],
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(req, res, company_id);
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        if (objects.length === 0) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "No object to remove from catalog",
                data: null
            };
        }

        objects = objects.map(x => x.trim());

        if (this.checkIfDuplicateExists(objects)) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Duplicate object(s) id in request body",
                data: null
            };
        }

        const errors: string[] = [];
        const ids: number[] = [];

        for (let i = 0; i < objects.length; i++) {
            const object_id = objects[i];
            const res = await this.catalogService.findOne({
                object_id: object_id,
                company: company_id
            });
            if (res == null) errors.push(i + " - \"object_id\" doesn't exists");
            else ids.push(res.id);
        }

        if (errors.length > 0 || ids.length === 0) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Some objects doesn't exists in catalog",
                data: errors
            };
        }

        const removedObjects = await this.catalogService.archiveArray(ids);
        if (removedObjects === null) {
            res.status(500);
            return {
                status: "KO",
                code: 500,
                description: "Some objects have not been removed due to a server error",
                data: null
            };
        } else {
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "Objects successfully removed from catalog",
                data: removedObjects
            };
        }
    }

    checkIfDuplicateExists(arr) {
        return new Set(arr).size !== arr.length;
    }

    generateNewId(company: User, iteration = 0, max_iteration = 10): string {
        if (iteration >= max_iteration) {
            throw new Error("Max iteration reached");
        }

        const object_id =
            company.id.toString() +
            "-" +
            Math.floor(Math.random() * 1000000).toString();
        this.catalogService.findOne({ object_id: object_id }).then(res => {
            if (res !== null) {
                console.error("Object id already exists");
                return this.generateNewId(
                    company,
                    iteration + 1,
                    max_iteration
                );
            }
        });

        return object_id;
    }

    checkObject(
        company: User,
        catalog: CatalogCreateDto | CatalogUpdateDto,
        number: number = 0
    ): string[] {
        const errors: string[] = [];

        // Catalog creation
        if (catalog instanceof CatalogCreateDto) {
            catalog.company = company.id;
            if (!catalog.company_name) {
                catalog.company_name = company.first_name + "-" + company.last_name;
            }

            if (!catalog.object_id)
                catalog.object_id = this.generateNewId(company);
            else {
                this.catalogService
                    .findOne({ object_id: `${catalog.object_id}` })
                    .then(res => {
                        if (res !== null)
                            errors.push(
                                number + " - \"object_id\" already exists"
                            );
                    });
            }
        }

        // Catalog update
        if (catalog instanceof CatalogUpdateDto) {
            if (catalog.object_id) {
                this.catalogService
                    .findOne({ object_id: `${catalog.object_id}` })
                    .then(res => {
                        if (res !== null)
                            errors.push(
                                number + " - \"object_id\" already exists"
                            );
                    });
            }
        }

        return errors;
    }

    async checkAuthorization(req: Request, res: Response, id: number) {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            };
        }

        const company = await this.userService.findOne({ id: data["id"] });

        if (!company) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description:
                    "Your user doesn't exists ant can't access this resource",
                data: null
            };
        }

        if (company.role === "admin") {
            // Admin can access all resources
            return company;
        } else {
            if (company.role !== "company" || company.id !== Number(id)) {
                res.status(403);
                return {
                    status: "KO",
                    code: 403,
                    description:
                        "You are not authorized to access this resource",
                    data: null
                };
            }

            if (!company.company_api_key) {
                res.status(403);
                return {
                    status: "KO",
                    code: 401,
                    description:
                        "You don't have any API key, please generate one before using this endpoint",
                    data: null
                };
            }

            // Wrong company API key
            if (company.company_api_key !== req.query["company_api_key"]) {
                res.status(403);
                return {
                    status: "KO",
                    code: 401,
                    description:
                        "API key is not valid in \"company_api_key\" query parameter",
                    data: null
                };
            }
        }

        return company;
    }

    @Get("filter")
    async filterCatalog(@Body() filterDto: CatalogFilterDto) {
        const result = await this.catalogService.filterCatalog(filterDto);
        return { data: result };
    }
}
