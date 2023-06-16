import { Controller, Post, UseGuards, Body, Req, Delete } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { User } from "../user/models/user.entity";
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Cart } from './models/cart.entity';
import { CatalogService } from 'src/catalog/catalog.service';
import { AddItemToCartDTO } from './models/addToCart.dto';
import { Catalog } from '../catalog/models/catalog.entity';
import { CartService } from './cart.service';
import { cpSync } from 'fs';

@Controller('cart')
export class CartController {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private catalogService: CatalogService,
		private cartService: CartService
	) { }


	@Post()
	@UseGuards(AuthGuard)
	async addItemToCart(@Body() addItemToCartDTO: AddItemToCartDTO, @Req() request: Request) {
		const cookie = request.cookies['jwt']
		const data = await this.jwtService.verifyAsync(cookie)
		const usr = await this.userService.findOne({ id: data['id'] })
		const catalogItems: Catalog[] = addItemToCartDTO.catalogItems;

		if (!addItemToCartDTO.catalogItems)
			return;
		if (!usr.cart) {
			const obj = {
				"capacity": 101,
				"catalogItems": null,
				"user": usr
			}
			const cart = await this.cartService.create(obj)
			usr.cart = cart
		}
		let cartCSV = (await this.cartService.findOne(usr.cart)).catalogItemsIdCSV
		for (const item of catalogItems) {
			const catalogItem = await this.catalogService.findOne(item);
			if (catalogItem)
				cartCSV += cartCSV.length == 0 ? catalogItem.id : "," + catalogItem.id
		}
		cartCSV = cartCSV.split(',').sort().join(',');
		console.log(cartCSV)
		await this.cartService.update(usr.cart.id, { catalogItemsIdCSV: cartCSV });
		return (await this.cartService.findOne(usr.cart))
	}


	@Delete()
	async delete(@Body() addItemToCartDTO: AddItemToCartDTO, @Req() request: Request) {
		const cookie = request.cookies['jwt']
		const data = await this.jwtService.verifyAsync(cookie)
		const usr = await this.userService.findOne({ id: data['id'] })
		const catalogItems: Catalog[] = addItemToCartDTO.catalogItems;

		if (!addItemToCartDTO.catalogItems)
			return;
		if (!usr.cart) {
			const obj = {
				"capacity": 101,
				"catalogItems": null,
				"user": usr
			}
			const cart = await this.cartService.create(obj)
			usr.cart = cart
		}
		const curCSV = (await this.cartService.findOne(usr.cart)).catalogItemsIdCSV
		let toRemCSV = ""
		for (const item of catalogItems) {
			const catalogItem = await this.catalogService.findOne(item);
			if (catalogItem)
				toRemCSV += toRemCSV.length == 0 ? catalogItem.id : "," + catalogItem.id
		}
		const temp = curCSV.split(",")
		console.log(toRemCSV);
		for (const id of toRemCSV.split(',')) {
			const index = temp.indexOf(id);
			console.log(index, " : ",  curCSV.split(',')[index])
			if (index !== -1) {
				console.log("Removing ", index , " from ", temp)
				console.log("Before ", temp)
				temp.splice(index, 1);
				console.log("After ", temp)
			}
		}
		console.log("result :",  temp)
		await this.cartService.update(usr.cart.id, { catalogItemsIdCSV: temp.join(',') });
		return (await this.cartService.findOne(usr.cart))
	}
}
