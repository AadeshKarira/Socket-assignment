exports.checkPassword = (str) =>
{
    try{
        var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return re.test(str);
    }catch (err) {
        return err;
    }
}