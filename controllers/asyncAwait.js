function firstProm(){
    return new Promise((resolve,reject)=>{
        setTimeout(() => {
            resolve('first success')
        }, 3000);
    })
}
async function display(){
    try {
        const user = await firstProm()
        console.log(user);
    } catch (error) {
        console.log(error);
    }
}
display()
