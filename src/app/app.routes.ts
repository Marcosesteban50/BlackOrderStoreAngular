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
import { AdminGuard } from './Compartidos/guards/admin.guard';
import { UserListComponent } from './Components/Security/user-list/user-list.component';
import { CartComponent } from './Components/Cart/cart/cart.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'services', component: LandingComponent },

  // Rutas heredadas
  { path: 'products', component: IndexProductComponent },
  { path: 'products/new', component: CreateProductComponent },
  { path: 'products/update/:id', component: EditProductComponent },
  { path: 'products/filter', component: FilterComponent },

  { path: 'categories', component: IndexCategoryComponent },
  {
    path: 'categories/new',
    component: CreateCategoryComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'categories/update/:id',
    component: EditCategoryComponent,
    canActivate: [AdminGuard],
  },

  // Auth
  { path: 'sign-up', component: SignUpComponent },
  { path: 'sign-in', component: SignInComponent },

  { path: 'cart', component: CartComponent },

  {
    path: 'guides',
    loadComponent: () =>
      import('./Components/Guides/index-guide/index-guide.component').then(
        (m) => m.IndexGuideComponent
      ),
  },
  {
    path: 'guides/manage',
    canActivate: [AdminGuard],
    loadComponent: () =>
      import('./Components/Guides/manage-guides/manage-guides.component').then(
        (m) => m.ManageGuidesComponent
      ),
  },
  {
    path: 'guides/new',
    canActivate: [AdminGuard],
    loadComponent: () =>
      import('./Components/Guides/guide-form/guide-form.component').then(
        (m) => m.GuideFormComponent
      ),
  },
  {
    path: 'guides/update/:id',
    canActivate: [AdminGuard],
    loadComponent: () =>
      import('./Components/Guides/guide-form/guide-form.component').then(
        (m) => m.GuideFormComponent
      ),
  },
  {
    path: 'guides/:slug',
    loadComponent: () =>
      import('./Components/Guides/guide-detail/guide-detail.component').then(
        (m) => m.GuideDetailComponent
      ),
  },

  { path: 'userList', component: UserListComponent },
];
