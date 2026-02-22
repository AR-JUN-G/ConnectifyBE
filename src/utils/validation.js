const thirdPartyValidator = require("validator");

const validateSignupData = (data) => {
  const { firstName, emailId, password } = data;
  let errors = {};

  if (
    !firstName ||
    typeof firstName != "string" ||
    firstName.trim().length == 0
  ) {
    errors.firstName = "A valid First Name is Required";
  }

  if (!emailId || !thirdPartyValidator.isEmail(emailId)) {
    errors.emailId = "A valid EmailId is Required";
  }

  if (!thirdPartyValidator.isStrongPassword(password)) {
    errors.password = "Provide a Strong Password";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateLoginData = (data) => {
  const {emailId} = data;
  let errors = {};
  if (!emailId || !thirdPartyValidator.isEmail(emailId)) {
    errors.emailId = "Invalid EmailID";
  }

  return{
    isValid:Object.keys(errors).length===0,
    error:errors
  }
};
module.exports = { validateSignupData,validateLoginData };
