import { Body, Controller, Get, Param, Put, Req, Res, UseGuards } from "@nestjs/common";
import { CatalogService } from "./catalog.service";
import { Request, Response } from "express";
import { AuthGuard } from "src/auth/auth.guard";
import { JwtService } from "@nestjs/jwt";
import { Catalog } from "./models/catalog.entity";

@Controller("user")
export class CatalogController {
  constructor(
    private catalogService: CatalogService,
    private jwtService: JwtService
  ) {
  }

  @Get()
  all() {
    return ["catalog"];
  }

  /*@UseGuards(AuthGuard)
  @Get("whoami")
  async whoami(@Req() request: Request) {
    const cookie = request.cookies["jwt"];
    const data = await this.jwtService.verifyAsync(cookie);
    return this.catalogService.findOne({ id: data["id"] });
  }

  @UseGuards(AuthGuard)
  @Put()
  editViaQuery(@Req() req: Request, @Body() catalog: Catalog) {
    const cookie = req.cookies["jwt"];
    const data = this.jwtService.verify(cookie);
    return this.catalogService.update(data["id"], catalog);
  }

  @UseGuards(AuthGuard)
  @Put(":id")
  editViaParam(@Req() req: Request, @Param("id") id: number, @Body() catalog: Catalog, @Res({ passthrough: true }) res: Response) {
    const cookie = req.cookies["jwt"];
    const data = this.jwtService.verify(cookie);
    console.log("ID", id);
    console.log("DATA", data);
    console.log("USER", catalog);
    if (data["id"] != id) {
      res.status(401);
      return {
        "status": "KO",
        "code": 401,
        "description": "You are not allowed to edit this user",
        "data": null
      };
    }
    try {
      res.status(200);
      return {
        "status": "OK",
        "code": 200,
        "description": "User was updated",
        "data": this.userService.update(data["id"], user)
      };
    } catch (e) {
      res.status(400);
      return {
        "status": "KO",
        "code": 400,
        "description": "User was not updated because of an error",
        "error": e,
        "data": null
      };
    }
  }*/
}
