//otp time stamp
exports.time_diff_min = (dateString) => {
    try{
        var ageInMilliseconds = new Date()  - new Date(dateString);
        return (ageInMilliseconds/1000/60); // convert to years
    }catch (err) {
        return err
    }
}