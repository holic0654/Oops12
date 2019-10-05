var iGCS_GUI = { VERSION: '1.1.2' }
// GUI
		function displayGUI(earth){
			// Local Variables
			var gui = new dat.GUI();
			var jar;
			var aaa;
			//ame_cnt = 1;

			parameters = {
				// Exmaples
				shp: "",
				ex1: false, ex2: false, ex3: false, ex4: false,

			/*	// File Upload
				name_load: "Orbit1",
				color_load: "#ffffff",*/

				// Parameters of Six Elements
				name_ose: "Orbit1",
				color_ose: "#ffffff",
				h: "", e: "",
				RA: "", incl: "", AP: "",
				TA: "",

				// Parameters of RV Vectors
				name_RV: "Orbit1",
				color_RV: "#ffffff",
				R_x: "", R_y: "", R_z: "",
				V_x: "", V_y: "", V_z: "",

				// Parameters of Lambert's
				name_lam: "Orbit1",// + name_cnt,
				color_lam: "#ffffff",
				L_x1: "", L_y1: "", L_z1: "",
				L_x2: "", L_y2: "", L_z2: "",
				L_delT: "",

				// Orbital Information
				pvLine: false, paLine: false, taLine: false, pln: false,

				// Ect Information
				eciFrame: false,

				// Parameters for control
				name_orb: "Orbit",
				rmv: function(){
					var selectedObject = earth.getObjectByName(parameters.name_orb);
					earth.remove(selectedObject);
				},
				cls: function(){
					var temp_length = earth.children.length;
					var i = 0;
					for (i = 4; i<=temp_length; i++)
					{
						earth.remove(earth.children[4]);
					}
				},

				////// Functions //////
				// File Upload
				add_load: function(){
					$('#upLoad')[0].click();
				},
				// Orbital Six Elements Algorithm
				add_ose: function(){
					// Local Constants
					var deg2rad = Math.PI/180;

					// Local Variables
					var h, e, RA, incl, AP, TA; 

					// Repeited Orbit Inspection
					var reObject = earth.getObjectByName(parameters.name_ose);
					if (reObject)
					{
						earth.remove(reObject);
					}

					// Parameters
					h    = parameters.h;
					e    = parameters.e;
					RA   = parameters.RA*deg2rad;
					incl = parameters.incl*deg2rad;
					AP   = parameters.AP*deg2rad;
					TA   = parameters.TA*deg2rad;

					// Orbit Generation
					var orbit = THOR.Orbit.OrbitalSixElements(h, e, RA, incl, AP, TA);
					orbit.name = parameters.name_ose;	// Orbital Name
					orbit.material.color.setHex(parameters.color_ose.replace("#", "0x")); // Orbital Color
					if (parameters.taLine && orbit.getObjectByName("TA Line")) { orbit.getObjectByName("TA Line").material.visible = true; }
					if (parameters.pvLine && orbit.getObjectByName("Position Line1")) {	orbit.getObjectByName("Position Line1").material.visible = true; }
					if (parameters.pvLine && orbit.getObjectByName("Position Line2")) {	orbit.getObjectByName("Position Line2").material.visible = true; }
					if (orbit.sixElements.e < 1)
					{
						orbit.getObjectByName("Plane").material.color.setHex(parameters.color_ose.replace("#", "0x")); // Orbital Plane Color
						if (parameters.paLine && orbit.getObjectByName("P-A Line")) { orbit.getObjectByName("P-A Line").material.visible = true; }
						if (parameters.pln && orbit.getObjectByName("Plane")) { orbit.getObjectByName("Plane").material.visible = true; }
					}
					
					//
					earth.add(orbit);
				},
				// RV Vectors
				add_RV: function(){
					// Local Variables
					var R, V, OSE;

					// Repeited Orbit Inspection
					var reObject = earth.getObjectByName(parameters.name_RV)
					if (reObject)
					{
						earth.remove(reObject);
					}

					// Variable Initialize
					R = [parameters.R_x*1, parameters.R_y*1, parameters.R_z*1];
					V = [parameters.V_x*1, parameters.V_y*1, parameters.V_z*1];

					OSE = THOR.Algorithm.OrbitalSixElements(R, V);

					//RV_h = OSE[0], RV_e = OSE[1], RV_RA = OSE[2], RV_incl = OSE[3], RV_AP = OSE[4], RV_TA = OSE[5];
					// Orbit Generation
					var orbit = new THOR.Orbit.OrbitalSixElements(OSE[0], OSE[1], OSE[2], OSE[3], OSE[4], OSE[5])

					// Orbit Property Exchange
					orbit.name = parameters.name_RV;	// Orbital Name
					orbit.material.color.setHex(parameters.color_RV.replace("#", "0x")); // Orbital Color
					if (parameters.taLine && orbit.getObjectByName("TA Line")) { orbit.getObjectByName("TA Line").material.visible = true; }
					if (parameters.pvLine && orbit.getObjectByName("Position Line1")) {	orbit.getObjectByName("Position Line1").material.visible = true; }
					if (parameters.pvLine && orbit.getObjectByName("Position Line2")) {	orbit.getObjectByName("Position Line2").material.visible = true; }
					if (orbit.sixElements.e < 1)
					{
						orbit.getObjectByName("Plane").material.color.setHex(parameters.color_RV.replace("#", "0x")); // Orbital Plane Color
						if (parameters.paLine && orbit.getObjectByName("P-A Line")) { orbit.getObjectByName("P-A Line").material.visible = true; }
						if (parameters.pln && orbit.getObjectByName("Plane")) { orbit.getObjectByName("Plane").material.visible = true; }
					}
					

					// Result
					earth.add(orbit);
				},

				// Lambert's Problem Algorithm
				add_lam: function(){	
					// Local Variables
					var R1 = [0, 0, 0], R2 = [0, 0, 0], del_t = 0;

					// Repeited Orbit Inspection
					var reObject = earth.getObjectByName(parameters.name_lam)
					if (reObject)
					{
						earth.remove(reObject);
					}

					// Orbit Generation
					R1[0] = parameters.L_x1*1, R1[1] = parameters.L_y1*1, R1[2] = parameters.L_z1*1;
					R2[0] = parameters.L_x2*1, R2[1] = parameters.L_y2*1, R2[2] = parameters.L_z2*1;
					del_t = parameters.L_delT;
					var orbit = new THOR.Orbit.Lambert(R1, R2, del_t, scl);

					// Orbit Property Exchange
					orbit.name = parameters.name_lam;
					orbit.material.color.setHex(parameters.color_lam.replace("#", "0x")); // Orbit Color
					if (parameters.taLine && orbit.getObjectByName("TA Line")) { orbit.getObjectByName("TA Line").material.visible = true; }
					if (parameters.pvLine && orbit.getObjectByName("Position Line1")) {	orbit.getObjectByName("Position Line1").material.visible = true; }
					if (parameters.pvLine && orbit.getObjectByName("Position Line2")) {	orbit.getObjectByName("Position Line2").material.visible = true; }
					if (orbit.sixElements.e < 1)
					{
						orbit.getObjectByName("Plane").material.color.setHex(parameters.color_lam.replace("#", "0x")); // Orbital Plane Color
						if (parameters.paLine && orbit.getObjectByName("P-A Line")) { orbit.getObjectByName("P-A Line").material.visible = true; }
						if (parameters.pln && orbit.getObjectByName("Plane")) { orbit.getObjectByName("Plane").material.visible = true; }
					}
					
					//
					earth.add(orbit);

					//name_cnt = name_cnt + 1;
				},
			}

			//////// Example ////////
			var ex   = gui.addFolder('궤도(Orbit)');
			//ex.add(parameters, 'shp', ['Circle', 'Ellipse', 'Parabola', 'Hyperbola']).name("Shape");
			var evntEx1 = ex.add(parameters, 'ex1').name("원(Circle)");
			var evntEx2 = ex.add(parameters, 'ex2').name("타원(Ellipse)");
			var evntEx3 = ex.add(parameters, 'ex3').name("포물선(Parabola)");
			var evntEx4 = ex.add(parameters, 'ex4').name("쌍곡선(Hyperbola)");

			evntEx1.onChange(function(jar){
				if (parameters.ex1)
				{
					var h = 55000;
					var e = 0;
					var RA = 0, incl = 0, AP = 0, TA = 0;

					var orbit = THOR.Orbit.OrbitalSixElements(h, e, RA, incl, AP, TA);
					orbit.name = "Circle";
					orbit.material.color.setHex("0xb6f6a7");
					earth.add(orbit);
				}
				else
				{
					var rmvObj = earth.getObjectByName("Circle");
					earth.remove(rmvObj);
				}
			});

			evntEx2.onChange(function(jar){
				if (parameters.ex2)
				{
					var h = 74500;
					var e = 0.65;
					var RA = 90, incl = 0, AP = 0, TA = 0;

					var orbit = THOR.Orbit.OrbitalSixElements(h, e, RA, incl, AP, TA);
					orbit.name = "Ellipse";
					orbit.material.color.setHex("0xecdd49");
					earth.add(orbit);
				}
				else
				{
					var rmvObj = earth.getObjectByName("Ellipse");
					earth.remove(rmvObj);
				}
			});

			evntEx3.onChange(function(jar){
				if (parameters.ex3)
				{
					var h = 82500;
					var e = 1;
					var RA = 90, incl = 0, AP = 0, TA = 0;

					var orbit = THOR.Orbit.OrbitalSixElements(h, e, RA, incl, AP, TA);
					orbit.name = "Parabola";
					orbit.material.color.setHex("0x98c8");
					earth.add(orbit);
				}
				else
				{
					var rmvObj = earth.getObjectByName("Parabola")
					earth.remove(rmvObj);
				}
			});

			evntEx4.onChange(function(jar){
				if (parameters.ex4)
				{
					var h = 90000;
					var e = 1.4;
					var RA = 90, incl = 0, AP = 0, TA = 0;

					var orbit = THOR.Orbit.OrbitalSixElements(h, e, RA, incl, AP, TA);
					orbit.name = "Hyperbola";
					orbit.material.color.setHex("0xf4606f");
					earth.add(orbit);
				}
				else
				{
					var rmvObj = earth.getObjectByName("Hyperbola")
					earth.remove(rmvObj);
				}
			});
			////// Algorithm //////
		/*	var algo = gui.addFolder('Orbit');*/
			// File Upload
		/*	var up = algo.addFolder("File Upload"); */
			up.add(parameters, 'name_load').name("Name");
			up.addColor(parameters, 'color_load').name("Color");
			up.add(parameters, 'add_load').name('Add');
			// Orbital Six  
			var ose = algo.addFolder("Orbital Six Elements");
			ose.add(parameters, 'name_ose').name("Name");
			ose.addColor(parameters, 'color_ose').name("Color");
			ose.add(parameters, 'h').name("h [km^2/s]");
			ose.add(parameters, 'e').name("e");
			ose.add(parameters, 'RA').name("Ω [Deg]");
			ose.add(parameters, 'incl').name("i [Deg]");
			ose.add(parameters, 'AP').name("ω [Deg]");
			ose.add(parameters, 'TA').name("θ [Deg]");
			ose.add(parameters, 'add_ose').name("Add");
			// RV
			var RV = algo.addFolder("Position-Velocity Vectors")
			RV.add(parameters, 'name_RV').name("Name");
			RV.addColor(parameters, 'color_RV').name("Color");
			RV.add(parameters, 'R_x').name("R_x [km]");
			RV.add(parameters, 'R_y').name("R_y [km]");
			RV.add(parameters, 'R_z').name("R_z [km]");
			RV.add(parameters, 'V_x').name("V_x [km/s]");
			RV.add(parameters, 'V_y').name("V_y [km/s]");
			RV.add(parameters, 'V_z').name("V_z [km/s]");
			RV.add(parameters, 'add_RV').name("Add");
			// Lambert's
			var lam  = algo.addFolder("Lambert's Problem");
			lam.add(parameters, 'name_lam').name("Name");
			lam.addColor(parameters, 'color_lam').name("Color");
			lam.add(parameters, 'L_x1').name("x_1 [km]");
			lam.add(parameters, 'L_y1').name("y_1 [km]");
			lam.add(parameters, 'L_z1').name("z_1 [km]");
			lam.add(parameters, 'L_x2').name("x_2 [km]");
			lam.add(parameters, 'L_y2').name("y_2 [km]");
			lam.add(parameters, 'L_z2').name("z_2 [km]");
			lam.add(parameters, 'L_delT').name("Interval Time [sec]");
			lam.add(parameters, 'add_lam').name("Add");


////////////////////////////////////////////////////////////////////////////


			// Information
			var orbInfo = gui.addFolder("Orbital Information");
			var paInfo = orbInfo.add(parameters, 'paLine').name("P-A Line");
			var taInfo = orbInfo.add(parameters, 'taLine').name("TA Line");
			var pvInfo = orbInfo.add(parameters, 'pvLine').name("Position Vectors");
			var plnInfo = orbInfo.add(parameters, 'pln').name("Orbital Plane");

			// Parigee-Apogee Line
			paInfo.onChange(function(jar){
				
				if (parameters.paLine)
				{	
					for (i = 3; i < earth.children.length; i++)
					{
						var getObject = earth.children[i].getObjectByName("P-A Line");
						if (getObject){ getObject.material.visible = true; }
					}
				} 
				else 
				{	
					for (i = 3; i < earth.children.length; i++)
					{
						var getObject = earth.children[i].getObjectByName("P-A Line");
						if (getObject){ getObject.material.visible = false; }
					}
				};
			});

			// True Anomaly Line
			taInfo.onChange(function(jar){
				
				if (parameters.taLine)
				{	
					for (i = 3; i < earth.children.length; i++)
					{
						var getObject = earth.children[i].getObjectByName("TA Line");
						if (getObject){ getObject.material.visible = true; }
					}
				} 
				else 
				{	
					for (i = 3; i < earth.children.length; i++)
					{
						var getObject = earth.children[i].getObjectByName("TA Line");
						if (getObject){ getObject.material.visible = false; }
					}
				};
			});

			// Position Vectors(for Lambert)
			pvInfo.onChange(function(jar){
				
				if (parameters.pvLine)
				{	
					for (var i = 4; i < earth.children.length; i++)
					{
						var getObject1 = earth.children[i].getObjectByName("Position Line1");
						var getObject2 = earth.children[i].getObjectByName("Position Line2");
						if (getObject1)
						{ 
							getObject1.material.visible = true; 
							getObject2.material.visible = true; 
						}
					}
				} 
				else 
				{	
					for (i = 4; i < earth.children.length; i++)
					{
						var getObject1 = earth.children[i].getObjectByName("Position Line1");
						var getObject2 = earth.children[i].getObjectByName("Position Line2");
						if (getObject1)
						{ 
							getObject1.material.visible = false; 
							getObject2.material.visible = false; 
						}
					}
				};
			});

			// Orbital Plane
			plnInfo.onChange(function(jar){
				
				if (parameters.pln)
				{	
					for (i = 3; i < earth.children.length; i++)
					{
						var getObject = earth.children[i].getObjectByName("Plane");
						if (getObject){ getObject.material.visible = true; }
					}
				} 
				else 
				{	
					for (i = 3; i < earth.children.length; i++)
					{
						var getObject = earth.children[i].getObjectByName("Plane");
						if (getObject){ getObject.material.visible = false; }
					}
				};
			});


			////////////////////////////////////////////////////////////////////

			//
			var etcInfo = gui.addFolder("Etc Information");
			//var eciInfo	= etcInfo.add(parameters, 'eciFrame').name("ECI Frame");


			// Remove
			gui.add(parameters, 'name_orb').name("Name");
			gui.add(parameters, 'rmv').name("Remove");
			gui.add(parameters, 'cls').name("Clear");

			gui.close();
		}