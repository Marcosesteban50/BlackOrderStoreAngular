import { CategoryDTO } from "../CategoryDTO/Category";

export interface ProductDTO{
    id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  categoryId?: string;
  categoryName?:string;
  category?: CategoryDTO;
  userId?: string;
  approved: boolean;
  available:boolean;
}

export interface ProductCreationDTO {
  name: string;
  description?: string;
  price: number;
  images?: File[];
  deletedImages?: string[];
  categoryId?: string;
}


export interface FilterProducts{
name:string;
categoryId:string;
available:boolean;
highPrice:boolean;
lowPrice:boolean;

}