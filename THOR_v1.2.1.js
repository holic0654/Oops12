var THOR = { VERSION: '1.1.9' };

///////////////////////////////////////////////////////////////////////////////

THOR.SolarSystem = {
	starField: function(radius, segments){
		var sphere = new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments), 
			new THREE.MeshBasicMaterial({
				map : THREE.ImageUtils.loadTexture('images/field.jpg'), 
				side: THREE.BackSide
			})
		);
		sphere.name = "StarField";
		return sphere
	},




	Sun: function(radius, segments){
		// Local Constant
		var deg2rad = Math.PI/180;
		// Sun Parameters
		var mu   = 132712000000;
		var a    = 149598023;
		var e    = 0.0167086;
		var RA   = -11.26*deg2rad;
		var incl = 7.16*deg2rad;
		var AP   = 114.21*deg2rad;
		var TA   = 0;

		var h = Math.sqrt(a*mu*(1 - Math.pow(e, 2)));

		var sphere = new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshBasicMaterial({
				map 	 : THREE.ImageUtils.loadTexture('images/map_sun.jpg'),
				shininess: 5,					
			})
		);

		var light = new THREE.PointLight(0xffffff, 1.0, 50000);
		sphere.add(light);
		sphere.name = "Sun";
		
		return sphere;
	},




	Earth: function(radius, segments){
		// Local Constant
		var deg2rad = Math.PI/180;
		// Earth
		var mu_s   = 132712000000;
		var a_e    = 149598023;
		var e_e    = 0.0167086;
		var RA_e   = -11.26*deg2rad;
		var incl_e = 7.16*deg2rad;
		var AP_e   = 114.21*deg2rad;
		var TA_e   = 0;
		var h_e    = Math.sqrt(a_e*mu_s*(1 - Math.pow(e_e, 2)));
		var T 	   = 31558149.504; // [Sec]

		// Local Variables
		var sphereGeo, sphere, cloud, orbit, outline
		var cTime, cTA, cPnt;

		//
		sphereGeo = new THREE.SphereGeometry(radius, segments, segments);
		sphere = new THREE.Mesh(sphereGeo,
			new THREE.MeshPhongMaterial({
				map 	   : THREE.ImageUtils.loadTexture('images/map_earth.jpg'),
				bumpMap    : THREE.ImageUtils.loadTexture('images/bumpMap_earth.jpg'),
				bumpScale  : 0.01,
				specularMap: THREE.ImageUtils.loadTexture('images/Map_water.png'),
				specular   : new THREE.Color('grey'),
				shininess  : 5,					
			})
		);
		sphere.name = "Earth";
		
		// Position
		cTime = Date.now();
		cTA   = 2*Math.PI/T*cTime;
		cPnt  = THOR.Algorithm.FindRV(h_e, e_e, RA_e, incl_e, AP_e, cTA, mu_s);
		sphere.position.set(cPnt[0]/scl, cPnt[1]/scl, cPnt[2]/scl);

		//
		cloud = new THREE.Mesh(
			new THREE.SphereGeometry(radius + radius/30, segments, segments),			
			new THREE.MeshLambertMaterial({
				map 	   : THREE.ImageUtils.loadTexture('images/map_clouds.png'),
				opacity	   : 0.9,
				transparent: true,
				depthWrite : false,
			})
		);
		cloud.name = "Cloud";
		sphere.add(cloud);

		// Outline
		outline = new THREE.Mesh(sphereGeo,
			new THREE.MeshDepthMaterial({
				color:0x2194ce,
				transparent: true,
				opacity: 0.3,
				side: THREE.BackSide,
			})
		);
		outline.position = sphere.position;
		outline.scale.multiplyScalar(1.03);
		sphere.add(outline);


		// Orbit - (h, e, RA, incl, AP, TA, scl, Type, Method)
		/*var orbit = THOR.Orbit.OrbitalSixElements(h, e, RA, incl, AP, TA, mu);
		orbit.material.color.setHex('0xa0a0a0');
		sphere.add(orbit); */

		//scene.name = "Earth";


		return sphere
	},





	Moon: function(radius, segments){		
		// Local Constant
		var deg2rad = Math.PI/180;
		// Moon
		var mu   = 398600;
		var a    = 384399;
		var e    = 0.0549006;
		var RA   = 0;
		var incl = 5.14*deg2rad;
		var AP   = 0;
		var TA   = 0;
		var h    = Math.sqrt(a*mu*(1 - Math.pow(e, 2)));
		var T 	 = 2360448; // [Sec]

		var sphere
		var cTime, cTA, cPnt;


		sphere = new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map 		: THREE.ImageUtils.loadTexture('images/map_moon.jpg'),
				bumpMap		: THREE.ImageUtils.loadTexture('images/bumpMap_moon.jpg'),
				bumpScale	: 0.1,
				shininess	: 5,					
			})
		);

		// Position
		cTime = Date.now();
		cTA   = 2*Math.PI/T*cTime;
		cPnt  = THOR.Algorithm.FindRV(h, e, RA, incl, AP, cTA, mu);
		sphere.position.set(cPnt[0]/scl, cPnt[1]/scl, cPnt[2]/scl);

		sphere.name = "Moon";

		return sphere;
	}	
}

//////////////////////////////////////////////////////////////////////////////

THOR.Algorithm = {
	Lambert: function(R1, R2, del_t){
		// Step 1 - Calculate r1 and r2
		var r1 = math.norm(R1), r2 = math.norm(R2);

		// Step 2 - Calculate True Anomaly.
		// Assum a Prograde Trajectory
		var cross12 = math.cross(R1, R2);
		if (cross12[2] >= 0)	
		{
			var TA = Math.acos(math.dot(R1, R2)/r1/r2);
		} 
		else if(cross12[2] < 0)
		{
			2*Math.PI - Math.acos(math.dot(R1, R2)/r1/r2);
		}

		// Step 3 - Calculate A Matrix
		var A = Math.sin(TA)*Math.sqrt(r1*r2/(1 - Math.cos(TA)));

		// Step 4 - Interation z = z - F/Fdot
		var z = 1.5,
			S = 0, C = 0,
			y = 0,
			F = 0, Fdot = 0,
			ratio = 1, cnt = 1,
			error = Math.pow(10, -6), cntmax = 5000;

		while ( (Math.abs(ratio) > error) && (cnt <= cntmax) )
		{
			S 	 = stumpff_S(z);
			C 	 = stumpff_C(z);
			y 	 = r1 + r2 + A*(z*S - 1) / Math.sqrt(C);
			F 	 = func_f(z, S, C, y, A, del_t);
			Fdot = func_fdot(z, S, C, y, A);

			z = z - F/Fdot;

			ratio = F/Fdot;
			cnt++;
		}

		if (cnt >= 5000)
		{
			alert('The Number of Iterations was Exceeded!');
		}

		// Step 5 - Calculate y, f, g, gdot
		y = r1 + r2 + A*(z*S - 1) / Math.sqrt(C);
		var Lag_f 	 = 1 - y/r1,
			Lag_g 	 = A*Math.sqrt(y/398600),
			Lag_gdot = 1 - y/r2;

		// Step 6 - Calculate v1, v2
		var V1 = [0, 0, 0], V2 = [0, 0, 0];
		for (var i = 0; i < 3; i++)
		{
			V1[i] = 1/Lag_g*(R2[i] - Lag_f*R1[i]);
			V2[i] = 1/Lag_g*(Lag_gdot*R2[i] - R1[i]);
		}

		return V1;
	},





	OrbitalSixElements: function(R, V){
		// Local Constant
		var mu = 398600;

		// Local Variables
		var H, N, E;
		var r, v, vr, h, n, e;
		var incl, RA, AP, TA;
		var result

		//
		r = Math.sqrt(math.dot(R, R));
		v = Math.sqrt(math.dot(V, V));

		//
		vr = math.dot(R, V)/r;

		// Angular Momentum
		H = math.cross(R, V);
		h = Math.sqrt(math.dot(H, H));

		// Inclination Angle
		incl = Math.acos(H[2]/h);

		// Normal Vector
		N = math.cross([0, 0, 1], H);
		n = Math.sqrt(math.dot(N, N));
		// Right Ascention
		if ( N[1] >= 0 )
		{
			RA = Math.acos(N[0]/n);
		}
		else if ( N[1] < 0 )
		{
			RA = 2*Math.PI - Math.acos(N[0]/n);
		}

		// Eccetricity
		E = [0, 0, 0];
		E[0] = 1/mu*((Math.pow(v, 2) - mu/r)*R[0] - r*vr*V[0]);
		E[1] = 1/mu*((Math.pow(v, 2) - mu/r)*R[1] - r*vr*V[1]);
		E[2] = 1/mu*((Math.pow(v, 2) - mu/r)*R[2] - r*vr*V[2]);

		e = Math.sqrt(math.dot(E, E));

		// Argument of Perigee
		if ( E[2] >= 0 )
		{
			AP = Math.acos(math.dot(N, E)/n/e);
		}
		else if ( E[2] < 0 )
		{
			AP = 2*Math.PI - Math.acos(math.dot(N, E)/n/e);
		}	

		//
		if ( vr >= 0)
		{
			TA = Math.acos(1/e*(Math.pow(h, 2)/mu/r - 1))
		}
		else if ( vr < 0 )
		{
			TA = 2*Math.PI - Math.acos(1/e*(Math.pow(h, 2)/mu/r - 1));
		}

		//
		result = [h, e, RA, incl, AP, TA];

		return result;
	},




	FindRV: function(h, e, RA, incl, AP, TA, mu) {
		// Local Constant
		if (mu === undefined){mu = 398600};

		// Local Variables
		var Rp, Vp, R, V
		var DCM, m1, m2, m3
		var temp;

		// Perifocal Frame
		Rp = new THREE.Vector4(Math.cos(TA), Math.sin(TA), 0, 0);
		Vp = new THREE.Vector4(-Math.sin(TA), e + Math.cos(TA), 0, 0);
		Rp.multiplyScalar(Math.pow(h,2)/mu/(1 + e*Math.cos(TA)));
		Vp.multiplyScalar(mu/h);

		// DCM Matrix
		DCM = new THREE.Matrix4();
		m1  = new THREE.Matrix4();
		m2  = new THREE.Matrix4();
		m3  = new THREE.Matrix4();
		
		m1.makeRotationZ(RA);
		m2.makeRotationX(incl);
		m3.makeRotationZ(AP);

		DCM.multiplyMatrices(m1, m2);
		DCM.multiply(m3);

		// Euler Transformation
		temp = new THREE.Vector4(Rp.x, Rp.y, Rp.z);
		temp.applyMatrix4(DCM);
		R = temp;

		temp = new THREE.Vector4(Vp.x, Vp.y, Vp.z);
		temp.applyMatrix4(DCM);
		V = temp;

		// Coordinates Transformation
		temp = [R.y, R.z, R.x, V.y, V.z, V.x];
		return temp;
	},

	FindOrbit: function(h, e, RA, incl, AP, TA, mu, scl){
		var temp, time, cTA; 

		// Orbital Position Vectors
		var positions = [];

		// For Spacecraft Animation
		var T, n, E, Me, t = [], k = 0;

		T = 2*Math.PI/Math.pow(mu,2)*Math.pow(h/Math.sqrt(1 - Math.pow(e,2)),3);
		n = 2*Math.PI/T;

		if (e == 1)
		{
			for (var iTA = -8*Math.PI/9; iTA < 8*Math.PI/9;)
			{		
				temp = THOR.Algorithm.FindRV(h, e, RA, incl, AP, iTA, mu);
				positions.push(new THREE.Vector3(temp[0]/scl, temp[1]/scl, temp[2]/scl));

				iTA = iTA + 14*Math.PI/9/5000;
				k++;
			}
		}
		else if(e != 1 && e >= 0)
		{
			for (var iTA = TA; iTA < (TA + 2*Math.PI);)
			{		
				temp = THOR.Algorithm.FindRV(h, e, RA, incl, AP, iTA, mu);
				positions.push(new THREE.Vector3(temp[0]/scl, temp[1]/scl, temp[2]/scl));

				E  = 2*Math.atan((1-e)/(1+e)*Math.pow(Math.tan(iTA/2), 2));
				//if (E > Math.PI) {E = Math/PI - }
				Me = E - e*Math.sin(E);
				t[k] = Me/n;

				iTA = iTA + 2*Math.PI/5000;
				k++;

				positions.animationTime = t;
			}
		}

		return positions
	},
}


////////////////////////////////////////////////////////////////////////////


THOR.Orbit = {
	Lambert: function(R1, R2, del_t, scl){
		// Local Constantconsole
		var mu = 398600;

		if (typeof scl === undefined)
		{
			scl = 10000;
		}

		// Local Variables
		var R, V, rP, rA, temp;
		var elements, h, e, TA, RA, incl, AP;
		var orbPts = [], orbGeo, orbMat, orbit;

		//
		R = R1;
		V = THOR.Algorithm.Lambert(R1, R2, del_t);

		// ###### Find the Orbit Position Array ######
		elements = THOR.Algorithm.OrbitalSixElements(R, V);
		h    = elements[0], e  = elements[1], RA = elements[2],
		incl = elements[3], AP = elements[4], TA = elements[5];

		var a = Math.pow(h, 2)/mu/(1 - Math.pow(e, 2));

    	// Orbit
		orbGeo          = new THREE.Geometry();
		orbGeo.vertices = THOR.Algorithm.FindOrbit(h, e, RA, incl, AP, TA, mu, scl);
		orbMat          = new THREE.LineBasicMaterial( {color : 0xffffff, linewidth: 5} );
		orbit           = new THREE.Line(orbGeo, orbMat);

		// Orbital Information
		orbit.positionData = orbGeo.vertices;
		orbit.sixElements  = {h: h, e: e, RA: RA, incl: incl, AP: AP, TA: TA};
		// Position Vectors1
		r1Geo = new THREE.Geometry();
		r1Geo.vertices.push(new THREE.Vector3(0, 0, 0));
		r1Geo.vertices.push(new THREE.Vector3(R1[1]/scl, R1[2]/scl, R1[0]/scl));
		r1Mat = new THREE.LineBasicMaterial({
			color: 0x00ffff,
			linewidth: 5,
			visible: false,
		});
		r1Line = new THREE.Line(r1Geo, r1Mat);
		r1Line.name = "Position Line1";
		orbit.add(r1Line);

		// Position Vector2
		r2Geo = new THREE.Geometry();
		r2Geo.vertices.push(new THREE.Vector3(0, 0, 0));
		r2Geo.vertices.push(new THREE.Vector3(R2[1]/scl, R2[2]/scl, R2[0]/scl));
		r2Mat = new THREE.LineBasicMaterial({
			color: 0x00ffff,
			linewidth: 5,
			visible: false,
		});
		r2Line = new THREE.Line(r2Geo, r2Mat);
		r2Line.name = "Position Line2";
		orbit.add(r2Line);
		// etc.
		orbit = THOR.Orbit.Information(orbit);

		return orbit;
	}, // -- LP End --





	OrbitalSixElements: function(h, e, RA, incl, AP, TA, mu, scl){
		// Local Constants
		if (mu === undefined){ mu = 398600; };
		if (scl === undefined){ scl = 10000; };
		var a = Math.pow(h, 2)/mu/(1 - Math.pow(e, 2));

		// Local Variables
		var rP, rA, rTA, temp, result;
		var orbGeo, orbMat, orbit;

		//
		orbGeo = new THREE.Geometry();
		orbGeo.vertices = THOR.Algorithm.FindOrbit(h, e, RA, incl, AP, TA, mu, scl);
		/*for (var i = TA; i < (TA + 2*Math.PI);)
		{		
			temp = THOR.Algorithm.FindRV(h, e, RA, incl, AP, i, mu);
			
			orbPts.push(new THREE.Vector3(temp[0]/scl, temp[1]/scl, temp[2]/scl));
			orbGeo.vertices.push(new THREE.Vector3(temp[0]/scl, temp[1]/scl, temp[2]/scl));

			i = i + 2*Math.PI/1000;
		}*/
	
		// Orbit
		orbMat = new THREE.LineBasicMaterial( {color : 0xffffff, linewidth: 5} );
		orbit  = new THREE.Line(orbGeo, orbMat);

		// Objects of the Orbit.
		orbit.positionData = orbGeo.vertices;
		orbit.sixElements  = {h: h, e: e, RA: RA, incl: incl, AP: AP, TA: TA};

		// Orbit Info Vectors
		orbit = THOR.Orbit.Information(orbit, mu, scl);

		return orbit;
	}, // -- OSE End --




	// 수정중
	Position: function(h, e, RA, incl, AP, TA, mu){
		// Local Constant
		var temp, T, TA, cTime, R = [];

		T     = 2*Math.PI/Math.pow(mu,2)*Math.pow(h/Math.sqrt(1 - Math.pow(e,2)), 3);
		cTime = Math.ceil(T*TA/2/Math.PI);
		for (i = 0; i <= T; i++)
		{
			TA = 2*Math.PI/T*i
			temp = THOR.Algorithm.FindRV(h, e, RA, incl, AP, TA, mu);
			R.push([temp[0], temp[1], temp[2]]);
		}
		this.Pst = R;
		this.TA = [R[cTime][0], R[cTime][1], R[cTime][2]];

	}, // -- Position END --

	Information: function(orbit, mu, scl){
		if (mu === undefined){ mu = 398600 };
		if (scl === undefined){ scl = 10000 };
		var h, e, RA, incl, AP, TA, a;
		h    = orbit.sixElements.h;
		e    = orbit.sixElements.e;
		RA   = orbit.sixElements.RA;
		incl = orbit.sixElements.incl;
		AP   = orbit.sixElements.AP;
		TA   = orbit.sixElements.TA;
		a    = Math.pow(h, 2)/mu/(1 - Math.pow(e, 2));

		// Orbit Info Vectors
		// True Anomaly
		rTA = THOR.Algorithm.FindRV(h, e, RA, incl, AP, TA, mu);

		taGeo = new THREE.Geometry();
		taGeo.vertices.push(new THREE.Vector3(0, 0, 0));
		taGeo.vertices.push(new THREE.Vector3(rTA[0]/scl, rTA[1]/scl, rTA[2]/scl));
		taMat = new THREE.LineBasicMaterial({
			color: 0xff3030,
			linewidth: 5,
			visible: false,
		});
		taLine = new THREE.Line(taGeo, taMat);
		taLine.name = "TA Line";

		orbit.add(taLine);
		// -- True Anomaly END --

		if (orbit.sixElements.e < 1)
		{			
			// Perigee
			rP = THOR.Algorithm.FindRV(h, e, RA, incl, AP, 0, mu);
			// Apogee
			rA = THOR.Algorithm.FindRV(h, e, RA, incl, AP, Math.PI, mu);

			paGeo = new THREE.Geometry();
			paGeo.vertices.push(new THREE.Vector3(rA[0]/scl, rA[1]/scl, rA[2]/scl));
			paGeo.vertices.push(new THREE.Vector3(rP[0]/scl, rP[1]/scl, rP[2]/scl));
			paMat = new THREE.LineBasicMaterial({
				color: 0x008800,
				linewidth: 5,
				visible: false,
			});
			paLine = new THREE.Line(paGeo, paMat);
			paLine.name = "P-A Line";

			orbit.add(paLine);
		
			// Orbital Plane
			plnGeo = new THREE.PlaneBufferGeometry(2.5*a/10000, 2.5*a/10000, 1, 1);
			plnMat = new THREE.MeshBasicMaterial({
				color: 0xffffff, 
				side: THREE.DoubleSide,
				transparent: true, 
				opacity: 0.2,
				visible: false,
			});
			pln = new THREE.Mesh(plnGeo, plnMat);
		
			// Euler Transform 3-1-3
			var mat = new THREE.Matrix4();
			var m1 = new THREE.Matrix4();
			var m2 = new THREE.Matrix4();
			var m3 = new THREE.Matrix4();
			m1.makeRotationZ(RA);
			m2.makeRotationX(incl);
			m3.makeRotationZ(AP);

			mat.multiplyMatrices(m1, m2);
			mat.multiply(m3);

			pln.applyMatrix(mat);

			// Perifocal to Scene Frame
			m1.makeRotationX(-Math.PI/2);
			m2.makeRotationY(0);
			m3.makeRotationZ(-Math.PI/2);

			mat.multiplyMatrices(m1, m2);
			mat.multiply(m3);

			pln.applyMatrix(mat);

			// Orbital Plane Position
			pln.position.set(rP[0]/scl/2 + rA[0]/scl/2, rP[1]/scl/2 + rA[1]/scl/2, rP[2]/scl/2 + rA[2]/scl/2);
			pln.name = "Plane";
			orbit.add(pln); // -- Plane End --
		}

		return orbit
	},
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


// Object
function CreatSpacecraft(parent, x, y, z){
	var loader = new THREE.OBJMTLLoader();
	loader.load(
		// OBJ resource URL
		'obj/LowPolySpaceShip/SpaceShip.obj',

		// MTL resource URL
		'obj/LowPolySpaceShip/SpaceShip.mtl',

		// Function when both resources are loaded
		function(object){
			object.scale.set(0.005, 0.005, 0.005);
			object.position.set(x, y, z);
			object.name = "Spacecraft";

			parent.add(object);
		},

		// FUnction called when downloads progress
		function(xhr){
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
		},

		// Function called when downloads error
		function(xhr){
			console.log('An error happened');
		}
	);
}

// Function
function stumpff_C(z){
	if (z > 0)
	{
		var result = (1 - Math.cos(Math.sqrt(z))) / z;
	}
	else if (z < 0)
	{
		var result = (math.cosh(Math.sqrt(-z)) - 1) / (-z);
	}
	else
	{
		var result = 1/2;
	}
	
	return result
}	

function stumpff_S(z){
	if (z > 0)
	{
		var result = (Math.sqrt(z) - Math.sin(Math.sqrt(z))) / Math.pow(Math.sqrt(z), 3);
	}
	else if (z < 0)
	{
		var result = (math.sinh(Math.sqrt(-z)) - Math.sqrt(-z)) / Math.pow(Math.sqrt(-z), 3);
	}
	else
	{
		var result = 1/6;
	}
	
	return result
}

function func_f (z, S, C, y, A, del_t) {
	var result = Math.pow(y/C, 1.5)*S + A*Math.sqrt(y) - Math.sqrt(398600)*del_t;

	return result
}

function func_fdot (z, S, C, y, A) {
	if (z == 0)
	{
		var result = Math.sqrt(2)/40*Math.pow(y, 1.5) + A/8*(Math.sqrt(y) + A*Math.sqrt(1/2/Math.sqrt(y)));
	}
	else
	{
		var result = Math.pow(y/C, 1.5)*(0.5/z*(C - 1.5*S/C) + 0.75*Math.pow(S, 2)/C) + A/8*(3*S/C*Math.sqrt(y) + A*Math.sqrt(C/y));
	}

	return result;
}

// 수정 요망
function KeplerEulerMethod(R, V, h, e, RA, incl, AP, TA, type) {	
	// Local Constants
	if (type === "Sun"){
		var mu = 132712000000;
	} else{
		var mu = 398600;
	};

	var x = [ [ R[0], R[1], R[2], V[0], V[1], V[2] ] ];
	var k1 = [0], k2 = [0], k3 = [0], k4 = [0];
	var temp1  = [0], temp2  = [0], result = [0];

	// Set up a Time Step.
	var ma  = Math.pow(h, 2)/mu/(1 - Math.pow(e, 2));
	var Te = 2*Math.PI/Math.sqrt(mu)*Math.pow(ma, 1.5);
	var dt = 100;
	var table = Math.ceil(Te);
	var k =0;
	// Runge-Kutta 4th.
	for (var i = 0; i < table; i++)
	{
		result = math.multiply(KeplerEquation(x[k], 0), dt);

		x.push(math.add(x[k], result[0]));

		i = i + dt;
		k++;
	}

	return x;
}

// 수정 요망
function KeplerRk4 (R, V, h, e, RA, incl, AP, TA, type, scl) {
	// Local Constants
	if (type === "Sun"){
		var mu = 132712000000;
	} 
	else{
		var mu = 398600;
	};

	//var x = [ [ R.x, R.y, R.z, V.x, V.y, V.z ] ];
	var x = [ [ R[0], R[1], R[2], V[0], V[1], V[2] ] ];
	var k1 = [0], k2 = [0], k3 = [0], k4 = [0];
	var temp1  = [0], temp2  = [0], result = [0];

	/* Get Orbital Six Elements.
	var elements = THOR.Algorithm.OrbitalSixElements(R, V);
	var h  = elements[0], e    = elements[1], TA = elements[2],
		RA = elements[3], incl = elements[4], AP = elements[5];

	// Magnitude
	var r = Math.sqrt(math.dot(R, R));
	var v = Math.sqrt(math.dot(V, V));


	// Angular Momentum
	var H = math.cross(R, V);
	var h = Math.sqrt(math.dot(H, H));

	// Ecentricity
	var E = [0, 0, 0];
	E[0] = 1/mu*((Math.pow(v, 2) - mu/r)*R[0] - r*vr*V[0]);
	E[1] = 1/mu*((Math.pow(v, 2) - mu/r)*R[1] - r*vr*V[1]);
	E[2] = 1/mu*((Math.pow(v, 2) - mu/r)*R[2] - r*vr*V[2]);

	var e = Math.sqrt(math.dot(e, e)); */

	// Set up a Time Step.
	var ma  = Math.pow(h, 2)/mu/(1 - Math.pow(e, 2));
	var Te = 2*Math.PI/Math.sqrt(mu)*Math.pow(ma, 1.5);
	var dt = scl;
	var tt = Math.ceil(Te/scl);

	// Runge-Kutta 4th.
	for (var i = 0; i < tt; i++)
	{	
		k1[0] = math.multiply(KeplerEquation(x[i], 0, "Sun"), dt);
		k2[0] = math.multiply(KeplerEquation(math.add(x[i], math.multiply(k1[0], 0.5)), 0, "Sun"), dt);
		k3[0] = math.multiply(KeplerEquation(math.add(x[i], math.multiply(k2[0], 0.5)), 0, "Sun"), dt);
		k4[0] = math.multiply(KeplerEquation(math.add(x[i], k3[0]), 0, "Sun"), dt);

		temp1[0] = math.add(k1[0], math.multiply(k2[0], 2));
		temp2[0] = math.add(math.multiply(k3[0], 2), k4[0]);

		result[0] = math.divide(math.add(temp1[0], temp2[0]), 6);

		x.push(math.add(x[i], result[0]));
	}
	

	return x;
}

// 수정 요망
function KeplerEquation (x, u, mu) {
	// Local Constants
	if (type === "Sun"){
		var mu = 132712000000;
	} else{
		var mu = 398600;
	};
	// body...
	var R = [ x[0], x[1], x[2] ],
		V = [ x[3], x[4], x[5] ];
	var xdot1 = V;
	var xdot2 = math.multiply(R, -mu/Math.pow(math.norm(R), 3));

	var result = [ xdot1[0], xdot1[1], xdot1[2], xdot2[0], xdot2[1], xdot2[2] ];

	return result;
}







function SpacecraftAnimation(h, e, RA, incl, AP, TA, mu, scl){
	/*var theta, T, itv, t, temp
	var geo = new THREE.Geometry();

	T = Math.ceil(2*Math.PI/Math.pow(mu,2)*Math.pow(h/Math.sqrt(1 - Math.pow(e,2)),3));
	t = T + "";
	t = t.length;
	if (t < 5){	t = T/Math.pow(10, t - 1) }
	else if (t < 6) { t = T/Math.pow(10, t - 1) }
	else if (t < 7) { t = T/Math.pow(10, t - 2) }
	else if (t < 8) { t = T/Math.pow(10, t - 3) }
	else if (t < 9) { t = T/Math.pow(10, t - 4) }
	else { t = T/Math.pow(10, t - 5) }

	lng = T/t;
	itv = t;

	for (i = 0; i < lng; i++)
	{
		theta = 2*Math.PI/T*t
		temp = THOR.Algorithm.FindRV(h, e, RA, incl, theta, mu)
		geo.vertices.push(new THREE.Vector3(temp[0]/scl, temp[1]/scl, temp[2]/scl));
		t = t + itv
	}

	return geo; */
	var T, E, Me, t, n;

	T = 2*Math.PI/Math.pow(mu,2)*Math.pow(h/Math.sqrt(1 - Math.pow(e,2)),3);
	n = 2*Math.PI/T;
	E = 2*Math.atan((1-e)/(1+e)*Math.pow(Math.tan(TA/2), 2));
	Me = E - e*Math.sin(E);
	t = Me/n;

	return t
}