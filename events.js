function onDocumentMouseMove( event )
{
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentMouseOver() 
{
	ray = new THREE.Raycaster();
	ray.setFromCamera( mouse, camera );
	intersects = ray.intersectObjects( scene.children );

	if (intersects.length > 0)
	{

		if ( intersects[0].object.name )
		{
	    	context0.clearRect(0,0,640,480);
			var message = intersects[0].object.name;
			var metrics = context0.measureText(message);
			var width   = metrics.width;
				
			context0.fillStyle = "rgba(255,255,255,1)"; // text color
			context0.fillText( message, 127.5,20 );
			texture0.needsUpdate = true;

			var spriteMaterial = new THREE.SpriteMaterial({ 
				map: texture0,
				useScreenCoordinates: true, 
			});

			sprite0 = new THREE.Sprite( spriteMaterial );

			//if ( intersects[0].object.name === "Earth")
			//{
				sprite0.scale.set(5, 2.5, 0);
				sprite0.position.set( 0, 0, 0 );
				earth.add(sprite0);
			//}
			//else if (intersects[0].object.name === "Sun")
			//{
				sprite0.scale.set(500, 250, 0);
				sprite0.position.set(0, 0, 0);
				sunlight.add(sprite0);
			//}
		}
		else if (intersects[0].object.name === "")
		{
			context0.clearRect(0, 0, 640, 480);
			texture0.needsUpdate = true;
		}
	}
}

function onWindowResize(){

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}