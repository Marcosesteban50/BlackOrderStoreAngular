import { ProductDTO } from "../ProductDTO/Product";

export interface CategoryDTO {
    id: string;
    name: string;
    description:string;
    images?: string[];
}


export interface CreateCategoryDTO {
    name: string;
    images?: File[];
    description:string;
    product:ProductDTO[];

}


