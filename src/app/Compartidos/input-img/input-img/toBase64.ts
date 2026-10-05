export function toBase64(file:File): Promise<string>{
    //Promesa es como Programacion Asyncrona
    return new Promise((resolve,reject) =>{
        const reader = new FileReader();
        //leyendo el archivo
        reader.readAsDataURL(file);

        //Cuando termine de leer el File = cuando sea exitoso devolvemos resultado como string
        reader.onload = () => resolve(reader.result as string);

        reader.onerror = (error) => reject(error);
    })
}