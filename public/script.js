let Freelancer=document.querySelector('#Freelancer');
let producer=document.querySelector('#Producer');

Freelancer.addEventListener("click",()=>{
    gsap.to(".Additional",{
        x:200,
        duration:1,
        opacity:1,
        scale:1,
    })
})
producer.addEventListener("click",()=>{
    gsap.to(".Additional",{
        duration:0,
        opacity:0,
    })
})
