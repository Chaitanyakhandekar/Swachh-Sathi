export const parseCookies = (headers) => {
    let cookies = {};

    if(headers?.cookie){
        const rawCookies = headers.cookie.split(";").map(cookie=> cookie.split("="))
        cookies = {
            [rawCookies[0][0]?.trim()]: rawCookies[0][1],
            ...(rawCookies.length > 1 && {[rawCookies[1][0]?.trim()]: rawCookies[1][1]})
        }
    }
    return cookies;
}