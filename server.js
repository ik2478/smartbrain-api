const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');


//app.use(cors);
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'ik',
    password : '',
    database : 'smart-brain'
  }
});


//db.select('*').from('users').then(data=>console.log(data));


// database ={
// 	users:[	  
// 	  {
// 	  	id : 123,
// 	  	name :'Jack',
// 	  	email:'jack32@gmail.com',
// 	  	password:'cookies',
// 	  	entries:0,
// 	  	joined: new Date()

// 	  },
// 	  {
// 	  	id : 124,
// 	  	name :'John',
// 	  	email:'john@gmail.com',
// 	  	password:'cookies',
// 	  	entries:0,
// 	  	joined: new Date()
// 	  }
// 	]
// }
app.get('/',(req,res)=>{

	res.json('this is working');
})

app.post('/signin',(req,res)=>{
	if(!req.body.email || !req.body.password){
		return res.status(400).json('incorrect form submission')
	}
	db.select('email','hash').from('login')
	  .where('email','=',req.body.email)
	  .then(data =>{
	  	const isValid = bcrypt.compareSync(req.body.password,data[0].hash);
	  	console.log(isValid);
	  	if(isValid){

	  		return db.select('*').from('users')
	  		  .where('email','=',req.body.email)
	  		  .then(user =>{
	  		  	console.log(user);
	  		  	res.json(user[0])
	  		  })
	  		  .catch(err =>res.status(400).json('unable to get user'))
	  	}
	  	else{
	  		res.status(400).json('wrong creds')
	  	}

	  })
	   .catch(err =>res.status(400).json('wrong credentials'))
	  
	// if(req.body.email === database.users[0].email && 
	//    req.body.password === database.users[0].password){

	// 	res.json(database.users[0]);
	// }else{
	// 	    res.status(400).json('error signing in');
	// 	}
	
})

app.post('/register',(req,res)=>{

	const{name,email,password} = req.body
	if(!email || !name || !password){
		return res.status(400).json('incorrect form submission')
	}
	const hash = bcrypt.hashSync(password);
	db.transaction(trx=>{
	 	trx.insert({
	 		hash:hash,
	 		email:email
	 	})
	 	.into('login')
	 	.returning('email')
	 	.then(loginEmail =>{
	 		console.log(loginEmail)
	 		return trx('users').returning('*').insert({
	 			name:name,
	 			email:loginEmail[0],
	 			joined:new Date()
	        })    
	 		.then(user=>res.json(user[0]))
	 	    
	 	})
	 	.then(trx.commit)
	    .catch(trx.rollback)
	 })
	 .catch(err =>status(400).json('unable to register'));
		

	 

	//res.json(database.users[database.users.length-1]);

})

app.get('/users',(req,res)=>{

	res.send(database.users);
	
})

// app.get('/profile/:id',(req,res)=>{
	
// 	const {id} = req.params;
// 	console.log(id);
	
// 	let found = false;

// 	database.users.forEach(user=>{
// 		console.log(user);
// 		console.log("id is " + user.id);
// 		if (user.id === id){
// 			found = true;
// 			 res.json(user);
// 		}	
// 	})

// 	if(!found){
// 		res.status(400).json('not yet found')
// 	}

	
	
// })


app.get('/profile/:id', (req,res) =>{

	const {id} = req.params;
	let found = false;
	

	db.select('*').from('users').where({id:id})
	  .then(user=>{
	  	if(user.length){
	  		res.json(user[0]);

	  	} else{
	  		res.status(400).json("Not found");
	  	}

	  })
	  .catch(err => res.status(400).json('error getting user'))

	  	
	
})


app.put('/image', (req,res) =>{

	const {id} = req.body;
	db('users').where('id','=',id)
	.increment('entries',1)
	.returning('entries')
	.then(entries =>{
	  if(entries.length){
		res.json(entries[0]);
	  }else{
	  	res.status(400).json("Not found");
	  }
	})
	.catch(err=> res.status(400).json('unable to get entries'))



	// let found = false;
	// database.users.forEach(user =>{
	// 	if(user.id === id){
	// 		found = true;
	// 		user.entries++;
	// 		return res.json(user.entries);
	// 	}

	// })
	// if(!found){
	// 	res.json('fail');
	// }

})




app.listen(process.env.PORT || 3001,()=>{
	console.log(`server is running on port ${process.env.PORT}`)
});








// if( database.users.filter(element=>{element.email === req.body.email}) && 
// 	   database.users.filter(element=>{element.password === req.body.password}))
// 	   {

// 		res.json('success')
// 	}else{
// 		    res.status(400).json('error signing in');
// 		}
	
