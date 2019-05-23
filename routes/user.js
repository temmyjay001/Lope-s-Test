//---------------------------------------------signup page call------------------------------------------------------
exports.signup = function(req, res){
   var bcrypt = require('bcrypt');
   var sharp = require('sharp');
   var fs = require('fs');
   message = '';
   errmessage = '';
   var saltrounds = 10;
   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
      var fname= post.first_name;
      var lname= post.last_name;
      var mob= post.mob_no;
      var file = req.files.uploaded_image;
		var img_name=file.name;
 
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
                                 
              file.mv('public/images/upload_images/'+file.name, function(err) {
                             
               if (err)
 
               return res.status(500).send(err);
               bcrypt.hash(pass,saltrounds, function(err, hash){

                  var chk = "SELECT `user_name` FROM `users` WHERE `user_name`='" + name +"'";
                  var query = db.query(chk, function(err, result) {
                  if(result.length > 0){
                     errmessage = "Username already exist, choose a new username.";
                     res.render('signup.ejs',{errmessage: errmessage});
                     console.log(result);
                  }else{
                     var sql = "INSERT INTO `users`(`first_name`,`last_name`,`image`,`mob_no`,`user_name`, `password`) VALUES ('" + fname + "','" + lname + "','" + img_name + "','" + mob + "','" + name + "','" + hash + "')";
         
                     var query = db.query(sql, function(err, result) {
                     
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
exports.login = function(req, res){
  const bcrypt = require('bcrypt');
   var saltrounds = 10;
   var message = '';
   var sess = req.session; 

   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
      var p2 = "$2b$10$.N6EYvnD";
      if(name && pass){
         var sql="SELECT id, first_name, last_name, user_name, password FROM `users` WHERE `user_name`='"+name+"'";                           
      
         db.query(sql, function(err, results){      
         if(results.length > 0){
            req.session.userId = results[0].id;
            req.session.user = results[0];
            console.log(results[0].id);
            console.log(results[0].password);
            bcrypt.compare(pass,results[0].password, function(err,result){
               if (err) throw (err);
               console.log(result);
               if(result == true){
                  res.redirect('/home/dashboard');
               }else{
                  message = 'Wrong Credentials.';
                  res.render('index.ejs',{message: message});
               }
               
               
            })
            
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
//-----------------------------------------------dashboard page functionality----------------------------------------------
           
exports.dashboard = function(req, res, next){      
   var user =  req.session.user,
   userId = req.session.userId;
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";

   db.query(sql, function(err, results){
      res.render('dashboard.ejs', {user:user});    
   });       
};
//------------------------------------logout functionality----------------------------------------------
exports.logout=function(req,res){
   req.session.destroy(function(err) {
      res.redirect("/login");
   })
};
//--------------------------------render user details after login--------------------------------
exports.profile = function(req, res){

   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";          
   db.query(sql, function(err, result){  
      res.render('profile.ejs',{data:result});
   });
};
//---------------------------------edit users details after login----------------------------------
exports.editprofile=function(req,res){
   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";
   db.query(sql, function(err, results){
      res.render('edit_profile.ejs',{data:results});
   });
};
//----------------------------------Redirecting to write page------------------------------------------
exports.write=function(req,res){
   
   message='';
   errmessage='';
   var user =  req.session.user,
   userId = req.session.userId;
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }
   

    if(req.method == "POST"){
      
      var post  = req.body;
      var title= post.title;
      var date= new Date();
      var secret = post.secret;
      console.log(user.user_name);
      var chk = "SELECT `Title`, `Message`, `Date` FROM `secrets` WHERE `Title` = '"+title+"'";
      var query = db.query(chk, function(err, result) {
         if(result.length > 0){
            errmessage = "There is a secret with this title already";
            res.render('write',{errmessage: errmessage});
            console.log(result);
            
         }else{
            // var sql = "INSERT INTO `secrets`(`Title`, `Date`, `Message`) VALUES ('" + title + "','" + date + "','" + secret + "'))";

            // var query = db.query(sql, function(err, result) {
            //    console.log(result);
            // message = "Your secret has been kept";
            // res.render('write',{message: message});
            // });
            
               db.query("INSERT INTO `secrets`(`writer`,`Title`, `Message`, `Date`) VALUES (?,?,?,?)",[user.user_name,title,secret,date],function (err, result) {
               if (err) throw err;
               message = "Your secret has been kept";
               console.log("1 secret kept");
               
               res.render('write',{message: message});
              });
         }

         
      });


      

   } else {
      res.render('write');
   }
}

//-----------------------------------Save data from write page to database--------------------------------
exports.save=function(req,res){
   
   message = '';
   errmessage = '';
   
  

}
//---------------------------------------------Reading secrets from the database ----------------------------------------
exports.read=function(req,res){
   var data = "";
   message='';
   errmessage='';
   var user =  req.session.user,
   userId = req.session.userId;
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }
   var chk = "SELECT `Title`,`Message`,`Date` FROM `secrets` WHERE `writer` ='"+user.user_name+"'";
   db.query(chk,function(err,result){
      if(err) throw err;
      
      data = result;
      
      console.log(data);
      res.render('read',{data:data});
   })
   console.log(user.user_name)
   if(req.method == "POST"){
      var message="";
      var post = req.body;
      var title = post.gMess;
      var cdk = "SELECT `Title`,`Message`,`Date` FROM `secrets` WHERE `Title` ='"+title+"'";
      db.query(cdk,function(err,result){
      if(err) throw err;
      
      var test = result;

      console.log(test);
      //res.render('read',{message:message});
      
   })
   }
}

exports.getMessage=function(req,res){
   
   var post = req.body;
   var title = post.gMess;
   // console.log(user)
   var chk = "SELECT `Title`,`Message`,`Date` FROM `secrets` WHERE `Title` ='"+title+"'";
   db.query(chk,function(err,result){
      if(err) throw err;
      
      var test = result;

      console.log(test);
      res.render('mread',{test:test});

   })
}

exports.manage=function(req,res){
   var post = req.body;
   var user =  req.session.user,
   userId = req.session.userId;
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }
   var chk = "SELECT `Title` FROM `secrets` WHERE  `writer` = '"+user.user_name+"'";
   db.query(chk,function(err,result){
      if(err) throw err;
      
      var test = result;

      console.log(test);
      res.render('manage',{test:test});      

   })
   
}