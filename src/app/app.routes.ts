import { Routes } from '@angular/router';
import { IndexCategoryComponent } from './Components/Categories/index-category/index-category.component';
import { LandingComponent } from './Compartidos/landing/landing.component';
import { CreateCategoryComponent } from './Components/Categories/create-category/create-category.component';
import { EditCategoryComponent } from './Components/Categories/edit-category/edit-category.component';
import { SignUpComponent } from './Components/Security/sign-up/sign-up.component';
import { SignInComponent } from './Components/Security/sign-in/sign-in.component';
import { ListProductsComponent } from './Components/Products/list-products/list-products.component';
import { CreateProductComponent } from './Components/Products/create-product/create-product.component';
import { EditProductComponent } from './Components/Products/edit-product/edit-product.component';
import { FilterComponent } from './Components/Products/filter/filter.component';
import { IndexProductComponent } from './Components/Products/index-product/index-product.component';


export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'services', component: LandingComponent },


    // Rutas heredadas
    { path: 'products', component: IndexProductComponent },
    { path: 'products/new', component: CreateProductComponent },
    { path: 'products/update/:id', component: EditProductComponent },
    { path: 'products/filter', component: FilterComponent },



    { path: 'categories', component: IndexCategoryComponent },
    { path: 'categories/new', component: CreateCategoryComponent },
    { path: 'categories/update/:id', component: EditCategoryComponent },

    // Auth
    { path: 'sign-up', component: SignUpComponent },
    { path: 'sign-in', component: SignInComponent },

];

