//---------------------------------------------signup page call------------------------------------------------------
exports.signup = (req, res) => {
   const bcrypt = require('bcrypt');
   const sharp = require('sharp');
   const fs = require('fs');
   message = '';
   errmessage = '';
   const saltrounds = 10;
   if(req.method == "POST"){
      const post  = req.body;
      const name= post.user_name;
      const pass= post.password;
      const fname= post.first_name;
      const lname= post.last_name;
      const mob= post.mob_no;
      const file = req.files.uploaded_image;
		const img_name=file.name;
 
      if (!req.files)
		return res.status(400).send('No files were uploaded.');
      
      sharp('public/images/upload_images/'+file.name)
         .resize(300,300)
         .withMetadata()
         .toBuffer()
         .then( data => {
            fs.writeFileSync('public/images/upload_images/'+file.name, data);
            console.log(data)
         })
         .catch( err => {
            console.log(err);
      });						

		console.log(file);
	  	if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){
                                 
              file.mv('public/images/upload_images/'+file.name, (err) => {
                             
               if (err)
 
               return res.status(500).send(err);
               bcrypt.hash(pass,saltrounds, (err, hash) => {

                  const chk = "SELECT `user_name` FROM `users` WHERE `user_name`='" + name +"'";
                  const query = db.query(chk, (err, result) => {
                  if(result.length > 0){
                     errmessage = "Username already exist, choose a new username.";
                     res.render('signup.ejs',{errmessage: errmessage});
                     console.log(result);
                  }else{
                     const sql = "INSERT INTO `users`(`first_name`,`last_name`,`image`,`mob_no`,`user_name`, `password`) VALUES ('" + fname + "','" + lname + "','" + img_name + "','" + mob + "','" + name + "','" + hash + "')";
         
                     const query = db.query(sql, (err, result) => {
                     
                     message = "Succesful! Your account has been created.";
                     res.render('signup.ejs',{message: message});
                     });
                  }
               });
               })
         });
         }else {

            message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
            res.render('index.ejs',{message: message});
         }
      }else {
         res.render('signup');
      }
   };
 
//-----------------------------------------------login page call------------------------------------------------------
exports.login = (req, res) => {
   const bcrypt = require('bcrypt');
   const message = '';
   const sess = req.session; 

   if(req.method == "POST"){
      const post  = req.body;
      const name= post.user_name;
      const pass= post.password;
      

      if(name && pass){
         const sql="SELECT id, first_name, last_name, user_name, password FROM `users` WHERE `user_name`='"+name+"'";                           
      
         db.query(sql, (err, results) => {      
         if(results.length > 0){
            req.session.userId = results[0].id;
            req.session.user = results[0];
            console.log(results[0].id);
            console.log(results[0].password);
            bcrypt.compare(pass,results[0].password, (err,result) => {
               if (err) throw (err);
               console.log(result);
               if(result == true){
                  res.redirect('/home/dashboard');
               }else{
                  message = 'Wrong Credentials.';
                  res.render('index.ejs',{message: message});
               }
            });
            
      }
      else{
         message = 'Wrong Credentials.';
         res.render('index.ejs',{message: message});
      }
              
   });  
      }else{
         message = 'Please enter username and password';
         res.render('index.ejs',{message: message});
      }
      
   } else {
      res.render('index.ejs',{message: message});
   }     
};
//-----------------------------------------------dashboard page ality----------------------------------------------
           
exports.dashboard = (req, res, next) => {      
   const user =  req.session.user,
   userId = req.session.userId;
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }

   const sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";

   db.query(sql, (err, results) => {
      res.render('dashboard.ejs', {user:user});    
   });       
};
//------------------------------------logout ality----------------------------------------------
exports.logout = (req,res) => {
   req.session.destroy(
      (err) => {
         res.status(200).redirect("/login");
      }
   );
};
//--------------------------------render user details after login--------------------------------
exports.profile = (req, res) => {

   const userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   const sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";          
   db.query(sql, (err, result) => {  
      res.render('profile.ejs',{data:result});
   });
};
//---------------------------------edit users details after login----------------------------------
exports.editprofile = (req,res) => {
   const userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   const sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";
   db.query(sql, (err, results) => {
      res.render('edit_profile.ejs',{data:results});
   });
};
//----------------------------------Redirecting to write page------------------------------------------
exports.write = (req,res) => {
   
   message='';
   errmessage='';
   const user =  req.session.user,
   userId = req.session.userId;
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }
   

    if(req.method == "POST"){
      
      const post  = req.body;
      const title= post.title;
      const date= new Date();
      const secret = post.secret;
      console.log(user.user_name);
      const chk = "SELECT `Title`, `Message`, `Date` FROM `secrets` WHERE `Title` = '"+title+"'";
      const query = db.query(chk, (err, result) => {
         if(result.length > 0){
            errmessage = "There is a secret with this title already";
            res.render('write',{errmessage: errmessage});
            console.log(result);
            
         }else{
            const  sql= "INSERT INTO `secrets`(`writer`,`Title`, `Message`, `Date`) VALUES (?,?,?,?)";
            db.query(sql, [user.user_name,title,secret,date], (err, result) => {
                  if (err) throw err;
                  message = "Your secret has been kept";
                  console.log("1 secret kept");
                  
                  res.render('write',{message: message});
               }
            );
         }
      });
 } else {
      res.render('write');
   }
}

//-----------------------------------Save data from write page to database--------------------------------
exports.save = (req,res) => {
   
   message = '';
   errmessage = '';
   
  

}
//---------------------------------------------Reading secrets from the database ----------------------------------------
exports.read = (req,res) => {
   const data = "";
   message='';
   errmessage='';
   const user =  req.session.user,
   userId = req.session.userId;
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }
   const chk = "SELECT `Title`,`Message`,`Date` FROM `secrets` WHERE `writer` ='" + user.user_name + "'";
   db.query(chk,(err,result) => {
      if(err) throw err;
      
      data = result;
      
      console.log(data);
      res.render('read',{data:data});
   });
   console.log(user.user_name)
   if(req.method == "POST"){
      const message="";
      const post = req.body;
      const title = post.gMess;
      const cdk = "SELECT `Title`,`Message`,`Date` FROM `secrets` WHERE `Title` ='"+title+"'";
      db.query(cdk, (err,result) => {
      if(err) throw err;
      
      const test = result;

      console.log(test);
      //res.render('read',{message:message});
      
   })
   }
}

exports.getMessage = (req,res) => {
   
   const post = req.body;
   const title = post.gMess;
   // console.log(user)
   const chk = "SELECT `Title`,`Message`,`Date` FROM `secrets` WHERE `Title` ='"+title+"'";
   db.query(chk,(err,result) => {
      if(err) throw err;
      
      const test = result;

      console.log(test);
      res.render('mread',{test:test});

   })
}

exports.manage = (req,res) => {
   const post = req.body;
   const user =  req.session.user,
   userId = req.session.userId;
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }
   const chk = "SELECT `Title` FROM `secrets` WHERE  `writer` = '"+user.user_name+"'";
   db.query(chk,(err,result) => {
      if(err) throw err;
      
      const test = result;

      console.log(test);
      res.render('manage',{test:test});      

   })
   
}