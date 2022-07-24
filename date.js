exports.getDate=function(){
	var today= new Date();
	const options = {weekday: 'long', month: 'long', day: 'numeric' };
    return today.toLocaleDateString("en-US",options);

}