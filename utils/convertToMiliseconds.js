// Convert the hh:mm format returned from the API to miliseconds
function convertToMilliseconds(time){
     let [hour, minute] = time.split(':');
     return (parseInt(hour) * 60 + parseInt(minute)) * 60 * 1000;
}

module.exports = convertToMilliseconds;