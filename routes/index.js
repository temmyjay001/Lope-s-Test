/*
* GET home page.
*/
 
exports.index = (req, res) => {
    var message = '';
  res.render('index',{message: message});
 
};
