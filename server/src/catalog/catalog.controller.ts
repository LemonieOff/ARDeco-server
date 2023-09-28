import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res
} from "@nestjs/common";
import { CatalogService } from "./catalog.service";
import { UserService } from "../user/user.service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { Catalog } from "./models/catalog.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { User } from "../user/models/user.entity";

@Controller("catalog")
export class CatalogController {
    constructor(
        private catalogService: CatalogService,
        private jwtService: JwtService,
        private userService: UserService
    ) {}

    @Get()
    async getCatalog(@Query() filters: any) {
        let items = await this.catalogService.all();

        if (!filters) {
            // If no filters provided, return all items
            return items;
        }

        // Filter the catalog items based on the provided filters
        let r = items.filter(item => {
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
        return r;
    }

    @Post(":id/add")
    /*
    L’intégralité des meubles seront vérifiés avant de les ajouter en base de données. Si un meuble est invalide, rien ne sera inscrit en base de données et une erreur sera retournée à l’utilisateur
    Si la requête aboutit, un code HTTP 201 sera renvoyé ainsi que les meubles et leurs propriétés dans un tableau d’objets JSON
    */
    async add(
        @Req() req: Request,
        @Param("id") id: number,
        @Body() catalog: QueryPartialEntity<Catalog>[],
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(req, res, id);
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

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
            const isValid = this.checkObject(authorizedCompany, catalog[i], i);
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

    @Delete(":id/removeAll")
    async removeAll(
        @Req() req: Request,
        @Param("id") id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(req, res, id);
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        const removedObjects =
            await this.catalogService.deleteAllObjectsFromCompany(
                authorizedCompany.id
            );
        if (removedObjects === null) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Objects not removed",
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

    @Delete(":id/remove/:object_id")
    async removeOne(
        @Req() req: Request,
        @Param("id") id: number,
        @Param("object_id") object_id: string,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(req, res, id);
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        const object = await this.catalogService.findOne({
            object_id: object_id
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

        const removedObject = await this.catalogService.delete(object.id);
        if (removedObject === null) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Object doesn't exists in catalog",
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

    @Delete(":id/remove")
    async remove(
        @Req() req: Request,
        @Param("id") id: number,
        @Body() objects: string[],
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(req, res, id);
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
                object_id: object_id
            });
            if (res == null) errors.push(i + ' - "object_id" doesn\'t exists');
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

        const removedObjects = await this.catalogService.deleteArray(ids);
        if (removedObjects === null) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Some objects doesn't exists in catalog",
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

    generateNewId(
        company: User,
        iteration: number = 0,
        max_iteration: number = 10
    ): string {
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
        catalog: QueryPartialEntity<Catalog>,
        number: number
    ): string[] {
        catalog.company = company.id;
        if (!catalog.company_name) {
            catalog.company_name = company.first_name + "-" + company.last_name;
        }

        const errors: string[] = [];

        if (!catalog.object_id) catalog.object_id = this.generateNewId(company);
        else {
            this.catalogService
                .findOne({ object_id: catalog.object_id })
                .then(res => {
                    if (res !== null)
                        errors.push(number + ' - "object_id" already exists');
                });
        }

        if (!catalog.name) errors.push(number + ' - "name" field is required');
        if (!catalog.price)
            errors.push(number + ' - "Price" field is required');
        if (!catalog.styles)
            errors.push(number + ' - "Styles" field is required');
        if (!catalog.rooms)
            errors.push(number + ' - "Rooms" field is required');
        if (!catalog.width)
            errors.push(number + ' - "Width" field is required');
        if (!catalog.height)
            errors.push(number + ' - "Height" field is required');
        if (!catalog.depth)
            errors.push(number + ' - "Depth" field is required');
        if (!catalog.colors)
            errors.push(number + ' - "Colors" field is required');

        catalog.styles = catalog.styles
            .toString()
            .split(",")
            .map(x => x.trim())
            .join();
        catalog.rooms = catalog.rooms
            .toString()
            .split(",")
            .map(x => x.trim())
            .join();
        catalog.colors = catalog.colors
            .toString()
            .split(",")
            .map(x => x.trim())
            .join();

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

        // Targeted company id is not the same as the one in the JWT
        if (id.toString() !== data["id"].toString()) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You are not allowed to access this resource",
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

        if (!company["company_api_key"]) {
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
                    'API key is not valid in "company_api_key" query parameter',
                data: null
            };
        }

        return company;
    }
}
