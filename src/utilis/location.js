const generateURl=(url, Username)=>{
    return{
        Username,
        url,
        createdAt:new Date().getTime()
    }
}
module.exports=generateURl