import queryString from 'query-string';


const query = queryString.parseUrl(window.location.href).query;
const port = query && Number(query.port) || 1337;
console.log(process && process.env && process.env.NODE_ENV === "development")
export default {
    apiAddress: `http://localhost:${port}/`,
    isDev: process && process.env && process.env.NODE_ENV === "development"
};