const errorHandler = (err, req, res, next) => {
  console.log(err, "Logged Error");
  let errorList = {};
  
  if (err.name == "ValidationError") {
    Object.keys(err.errors).forEach((key) => {
      errorList[key] = err.errors[key].message;
    });
  }
  else if(err.code === 11000){
    const field=Object.keys(e.keyValue)[0];
    const message= `Duplicate Entry '${field}'`;
  }
};

module.exports = errorHandler;
