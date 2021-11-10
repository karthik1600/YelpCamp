const mongoose = require('mongoose')
const campground = require('../models/campground'); //double . . to back out as we are in another directorynode seed
const cities = require('./cities.js')
const {places,descriptors} = require('./seedhelpers.js')
mongoose.connect('mongodb://localhost:27017/yelp_camp',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));//everytime error occurs
db.once('open',()=>{           //only once when db connected
    console.log('connected');
})
const sample = arr => arr[Math.floor(Math.random()*arr.length)];
const seedDb= async ()=>{
    await campground.deleteMany({});
    for(let i=0;i<500;i++){
        const rand1000 =Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
            const camp = new campground({
              location: `${cities[rand1000].city},${cities[rand1000].state}`,
              title: `${sample(descriptors)} ${sample(places)}`,
              image: [
                {
                  url: "https://res.cloudinary.com/de4tlcrzr/image/upload/v1636437916/YelpCamp/lbexymgsgqc9bnzqy2u6.jpg",
                  filename: "YelpCamp/lbexymgsgqc9bnzqy2u6",
                },
              ],
              geometry: {
                type: "Point",
                coordinates: [
                  cities[rand1000].longitude,
                  cities[rand1000].latitude,
                ],
              },
              description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!",
              price,
              author: "61759d4c2ce83c3ae0101fca",
            });
            await camp.save();
    }
}
seedDb().then(()=>{
    mongoose.connection.close()
})