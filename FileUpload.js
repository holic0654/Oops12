///////////////////////////////////////////////////////////////////
var Loadfile = { VERSION : '16.04.19'};
///////////////////////////////////////////////////////////////////
var scl = 10000;
LoadFile = {
	readFile: function(id, encoding){
		var positions = new Array();
		var reader = new FileReader();
		

		if(document.getElementById(id).files[0] == null) { return; }
		else { file = document.getElementById(id).files[0]; };

		if(!encoding){encoding = 'UTF-8'};

		reader.readAsText(file, encoding);
		reader.onload = function(){
			// Data Replace
			var pst_data    = reader.result.split(/[\t,\n]+/);
			var data_length = pst_data.length;
			for (var i=0; i<data_length - 1; i+=3)
			{
				positions.push(new THREE.Vector3(pst_data[i+1]/scl, pst_data[i+2]/scl, pst_data[i]/scl));
			}
		}
		var orbGeo = new THREE.Geometry();
		orbGeo.vertices = positions;
		var orbMat = new THREE.LineBasicMaterial( {color : 0xffffff, linewidth: 5} );
		var orbit  = new THREE.Line(orbGeo, orbMat);

		orbit.name = parameters.name_load;
		orbit.material.color.setHex(parameters.color_load.replace("#", "0x")); // Orbit Color

		file.name = "";

		return orbit
	}
}