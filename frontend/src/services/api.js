const API_BASE_URL=(import.meta.env.VITE_API_BASE_URL||'http://localhost:5000/api/v1').replace(/\/$/,'')
async function request(path,options={}){
 const response=await fetch(`${API_BASE_URL}${path}`,{headers:{Accept:'application/json',...options.headers},...options})
 if(!response.ok)throw new Error(`Request gagal: ${response.status} ${response.statusText}`)
 if(response.status===204)return null
 return response.json()
}
export const getProducts=()=>request('/products')
export const getProductById=id=>request(`/products/${encodeURIComponent(id)}`)
