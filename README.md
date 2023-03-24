# MongoDb and Nest (From the nestjs Docs)

- Nest supports two methods for integrating with **MongoDB** you can either use the built-in **TypeORM** module or you can use **Mongoose** from `@nestjs/mongoose`.

### Steps

1. Install mongoose

   ```
   npm i @nestjs/mongoose mongoose
   ```

2. Import the `MongooseModule` into the root module `AppModule`

   ```ts
   //app.module.ts
   import { Module } from '@nestjs/common';
   import { MongooseModule } from '@nestjs/mongoose';

   @Module({
     imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
   })
   export class AppModule {}
   ```

   - The `forRoot()` function accepts the same argument as the `mongoose.connect()` from the mongoose package [here](https://mongoosejs.com/docs/connections.html)

3. **Model injection**

   - With mongoose everything is derived from a **Schema**, each schema maps to a Mongodb collection and defines the shape of the documents with that collection. Schemas are used to define Models, and models are responsible for creating and reading documents from the underlying Mongodb database.

   - Schemas can be created with NestJS decorators or Mongoose itself manually

     ```ts
     //schemas/cat.schema.ts
     import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
     import { HydratedDocument } from 'mongoose';

     export type CatDocument = HydratedDocument<Cat>;

     @Schema()
     export class Cat {
       @Prop()
       name: string;

       @Prop()
       age: number;

       @Prop()
       breed: string;
     }

     export const CatSchema = SchemaFactory.createForClass(Cat);
     ```

   - The `@Schema()` decorator marks a class as a schema definition. It maps our `Cat` class to a MongoDb collection of the same name, but with an additional `s` at the end - so the final mongo collection name will be `cats`

   - The `@Schema()` decorator accepts a single optional argument which is a schema options object. Think of it as the object you would normally pass as a second argument of the `mongoose.Schema` class constructor `new mongoose.Schema(_, options)`

   - The `@Prop()` decorator defines a property in the document. for example in the schema definition above we defined three properties: `name`, `age` and `breed`.

   - Defining a Schema property for arrays

     ```ts
     @Prop([string])
     tags: string[];
     ```

   - You can create an API level validation using the `@Prop()` decorator, for example if you want to set a property as required.

     ```ts
     @Prop({required: true})
     name: string;
     ```

   - **In case you want to specify relation to another model, later for populating you can use `@Prop()` decorator as well. For example if `Cat` has `Owner` which is stored in a different collection `owners`**, the property should have type and ref. for example.

     ```ts
     import * as mongoose from 'mongoose'
     import {Owner} from "../owners/schema/owner.schema"

     @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Owner'})
     owner: Owner;
     ```

   - The `cat.schema` file resides in a folder in the `cats` directory, where we also define the `CatsModule`. while you can stroe schema files wherever you prefer, Nest recommends storing them near their related **domain** objects, in the appropriate module directory.

     ```ts
     import { Module } from '@nestjs/common';
     import { MongooseModule } from '@nestjs/mongoose';
     import { CatsController } from './cats.controller';
     import { CatsService } from './cats.service';
     import { Cat, CatSchema } from './schemas/cat.schema';

     @Module({
       imports: [
         MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
       ],
       controllers: [CatsController],
       providers: [CatsService],
     })
     export class CatsModule {}
     ```

   - **In Nest you have to register everything to nest, the first step was to define schema but that will not make you able to use the schema in your service, so you have to register the schema in the root module**

   - After registering the schema you can **Inject** a `Cat` model into the `CatService` using the `@InjectModel()` decorator

     ```ts
     import { Model } from 'mongoose';
     import { Injectable } from '@nestjs/common';
     import { InjectModel } from '@nestjs/mongoose';
     import { Cat, CatDocument } from './schemas/cat.schema';
     import { CreateCatDto } from './dto/create-cat.dto';

     @Injectable()
     export class CatsService {
       constructor(
         @InjectModel(Cat.name) private catModel: Model<CatDocument>,
       ) {}

       async create(createCatDto: CreateCatDto): Promise<Cat> {
         const createdCat = new this.catModel(createCatDto);
         return createdCat.save();
       }

       async findAll(): Promise<Cat[]> {
         return this.catModel.find().exec();
       }
     }
     ```
