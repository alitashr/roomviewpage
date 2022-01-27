let publicUrl = process.env.PUBLIC_URL;
publicUrl = publicUrl ==='' ||publicUrl==='.' ? './': publicUrl;
publicUrl = publicUrl[publicUrl.length-1]!=='/' ? publicUrl+'/': publicUrl;

export const assetsFolder = publicUrl ;// process.env.PUBLIC_URL==='' || process.env.PUBLIC_URL==='.' ? './': process.env.PUBLIC_URL ;//'https://cdn.explorug.com/explorugentry/roomview/';//process.env.SERVER !=='local' ? 'https://cdn.explorug.com/explorugentry/roomview/':  './'; //'./'
console.log("assetsFolder", assetsFolder, 'process.env.PUBLIC_URL', process.env.PUBLIC_URL)

