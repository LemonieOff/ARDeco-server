import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Req,
    Res
} from "@nestjs/common";
import { Request, Response } from "express";
import { FavoriteFurniture } from "./models/favorite_furniture.entity";
import { FavoriteFurnitureService } from "./favorite_furniture.service";
import { JwtService } from "@nestjs/jwt";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";
import { FindOptionsWhere } from "typeorm";
import { CatalogService } from "src/catalog/catalog.service";


@Controller('favorite-furniture')
export class FavoriteFurnitureController {}

@Controller('favorite-gallery')
export class FavoriteGalleryController { 
    constructor(
    private favfurnitureService: FavoriteFurnitureService,
    private jwtService: JwtService,
    private userService: UserService,
    private catalogService: CatalogService
)  {} 


// @Get()
//     async all(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
//         const cookie = req.cookies["jwt"];
//         const data = cookie ? this.jwtService.verify(cookie) : null;

//         // Cookie or JWT not valid
//         if (!cookie || !data) {
//             res.status(401);
//             return {
//                 status: "KO",
//                 code: 401,
//                 description: "You are not connected",
//                 data: null
//             };
//         }

//         // Get all query parameters
//         const user_id_query = req.query["user_id"];
//         const limit_query = req.query["limit"];
//         const begin_pos_query = req.query["begin_pos"];
//         //const furniture_id_query = req.query["furniture_id"];

//         let user_id: number = Number(user_id_query);
//         let limit: number | null = Number(limit_query);
//         let begin_pos: number | null = Number(begin_pos_query);
//        // let furniture_id: string | null = String(furniture_id_query);
//         // If user_id query is set, check if it's a number and if the user exists
//         if (user_id_query) {
//             if (isNaN(user_id)) {
//                 res.status(400);
//                 return {
//                     status: "KO",
//                     code: 400,
//                     description: "User id must be a number",
//                     data: null
//                 };
//             }

//             const user = await this.userService.findOne({ id: user_id });
//             //const furniture = await this.catalogService.findOne({ object_id: furniture_id });

//             if (!user) {
//                 res.status(404);
//                 return {
//                     status: "KO",   
//                     code: 404,
//                     description: "User was not found",
//                     data: null
//                 };
//             }
//         } else {
//             user_id = null;
//         }

//         const items = await this.favfurnitureService.findAll(
//             user_id,
//             limit,
//             begin_pos
//         );

//        try { res.status(200);
//         return {
//             status: "OK",
//             code: 200,
//             description: "Favorite Gallery items",
//             data: items // si il m'y a pas d'item je dois faire un message avec un Code
//         };
//     } catch (e) {
//         res.status(501);
//         return {
//             status: "KO",
//             code: 501,
//             description: "Favorite Gallery list was not display because of an error",
//             error: e,
//             data: null
//         };
//     }
//     }

// @Post() // remettre en param le fourniture_id une fois que ca marche 
//     async post(
//         @Req() req: Request,
//         @Body() item: QueryPartialEntity<FavoriteFurniture>,
//         @Res({ passthrough: true }) res: Response
//     ) {
//         const cookie = req.cookies["jwt"];
//         const data = cookie ? this.jwtService.verify(cookie) : null;

//         // Cookie or JWT not valid
//         if (!cookie || !data) {
//             res.status(401);
//             return {
//                 status: "KO",
//                 code: 401,
//                 description:
//                     "You have to login in order to create a Favorite gallery",
//                 data: null
//             };
//         }

//         const user = await this.userService.findOne({ id: data["id"] });

//         if (!user) { // c'est pas le bon if il me faut "l’aménagement désigné n’est pas existant"
//             res.status(404);
//             return {
//                 status: "KO",
//                 code: 404,
//                 description: "You are not allowed to create a Favorite gallery because it does not exist",
//                 data: null
//             };
//         }

//         if (!item) {
//             res.status(409);
//             return {
//                 status: "KO",
//                 code: 409,
//                 description: "You are not allowed to create a Favorite gallery that is already existing",
//                 data: null
//             };
//         }

//         try {
//             item.user_id = user.id;
//             const result = await this.favfurnitureService.create(item);
//             res.status(201);
//             return {
//                 status: "OK",
//                 code: 201,
//                 description: "Favorite Gallery item was created",
//                 data: result
//             };
//         } catch (e) {
//             res.status(501);
//             return {
//                 status: "KO",
//                 code: 501,
//                 description: "Favorite Gallery item was not created because of an error",
//                 error: e,
//                 data: null
//             };
//         }
//     }

//     @Delete(":id")
//     async deleteItem(
//         @Req() req: Request,
//         @Param("id") id: number,
//         @Res({ passthrough: true }) res: Response
//     ) {
//         const item = await this.favfurnitureService.findOne({ id: id });

//         const authorizedUser = await this.checkAuthorization(
//             req,
//             res,
//             item,
//             "delete"
//         );
//         if (!(authorizedUser instanceof User)) return authorizedUser;

//         try {
//             const result = await this.favfurnitureService.delete(id);
//             res.status(200);
//             return {
//                 status: "OK",
//                 code: 200,
//                 description: "Favorite gallery item has successfully been deleted",
//                 data: result
//             };
//         } catch (e) {
//             res.status(501);
//             return {
//                 status: "OK",
//                 code: 501,
//                 description: "Server error",
//                 data: item
//             };
//         }
//     }

//     async checkAuthorization(
//         req: Request,
//         res: Response,
//         item: FavoriteFurniture,
//         action: string,
//         user_id: number | null = null
//     ) {
//         // Check if item exists only for "view", "edit" and "delete" actions
//         if (action === "view" || action === "edit" || action === "delete") {
//             if (!item) {
//                 res.status(404);
//                 return {
//                     status: "KO",
//                     code: 404,
//                     description: "Resource was not found",
//                     data: null
//                 };
//             }
//         }

//         const cookie = req.cookies["jwt"];
//         const data = cookie ? this.jwtService.verify(cookie) : null;

//         // Cookie or JWT not valid
//         if (!cookie || !data) {
//             res.status(401);
//             return {
//                 status: "KO",
//                 code: 401,
//                 description: "You are not connected",
//                 data: null
//             };
//         }

//         const user = await this.userService.findOne({ id: data["id"] });

//         if (!user) {
//             res.status(403);
//             return {
//                 status: "KO",
//                 code: 403,
//                 description:
//                     "You are not allowed to access/modify this resource",
//                 data: null
//             };
//         }   
//         return user;
//     }

}


