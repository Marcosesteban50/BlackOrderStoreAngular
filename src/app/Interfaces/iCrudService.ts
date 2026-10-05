import { Observable } from "rxjs";


export interface ICrudService<TDTO,TCreationDTO>{
    get():Observable<TDTO[]>;
    getById(id:string):Observable<TDTO>;
    update(id:string,model:TCreationDTO):Observable<any>;
    create(model:TCreationDTO): Observable<any>;
    delete(id:string): Observable<any>;
}