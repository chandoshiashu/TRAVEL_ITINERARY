const dark_mode_btn = document.getElementById("dark_btn");

if(dark_mode_btn){

	dark_mode_btn.addEventListener('click', ()=> {
		
		if(localStorage.getItem("darkMode") == "true"){
			localStorage.setItem("darkMode", "false");
			disableDarkMode();
		}
		else{
			localStorage.setItem("darkMode", "true");
			enableDarkMode();
		}

	});
}


if (localStorage.getItem("darkMode") === "true") {

    enableDarkMode();

} else {

    disableDarkMode();

}

function enableDarkMode(){

	document.body.style.backgroundColor = "#253745";
	const nav_element = document.getElementById('main-nav');

	if(nav_element){
		nav_element.style.backgroundColor = "#06141B";
		nav_element.style.color = 'white';
	}


	const bg_img_element = document.getElementById('bg_image');

	if(bg_img_element){
		bg_img_element.style.opacity = '80%';
		bg_img_element.style.backgroundColor = 'gray';
	}

	const form_element = document.getElementById('form');
	if(form_element){
		form_element.style.backgroundImage = 'repeating-linear-gradient(25deg, #000000, transparent 400px);';
		form_element.style.color = "aliceblue";
	}

	const custom_plan = document.getElementById("custom_plan")
	if(custom_plan){
		custom_plan.style.backgroundColor = 'black';
	}

	const dark_mode_btn = document.getElementById('dark_btn');
	if(dark_mode_btn){
		dark_mode_btn.innerHTML = `LIGHT MODE`;
	}

	const contact_page_container = document.getElementById("contact_page_container");
	if(contact_page_container){
		contact_page_container.style.backgroundColor = "cadetblue";
	}

	const section2 = document.getElementById("section2");
	if(section2){
		section2.classList.add("dark_mode_on_cards");
		const cardParagraphs = document.querySelectorAll('#section2 .catcardmedia a p');
		cardParagraphs.forEach((element) => {
			if(element){
				element.style.color = "white";
			}
		});

		ExploreHeading = document.querySelector("#section2 .sectionHeader h1");
		if(ExploreHeading){
			ExploreHeading.style.color = 'white';
		}

		BlogHeading = document.querySelector("#section3 .sectionHeader h1");
		if(BlogHeading){
			BlogHeading.style.color = 'white';
		}
	}



}


function disableDarkMode(){
	document.body.style.backgroundColor = "#CFE1B9";
		

	const nav_element = document.querySelector('nav');
	const logo_anchor = document.getElementById("logo_anchor");

	if(nav_element){

		if(window.scrollY > 50){
			nav_element.style.backgroundColor = "#E7F5DC";
			nav_element.style.color = 'black';
			if(logo_anchor){
				logo_anchor.style.backgroundColor = "bg-[rgb(114, 129, 86)]";
			}
		}
		else{
			nav_element.style.backgroundColor = "#728156";
			if(logo_anchor){
				logo_anchor.style.backgroundColor = "transparent";
			}
		}


		const bg_img_element = document.getElementById('bg_image');
		if(bg_img_element){
			bg_img_element.style.opacity = '100%';
			bg_img_element.style.backgroundColor = 'gray';
		}

		const form_element = document.getElementById('form');
		if(form_element){
			form_element.style.backgroundImage = 'background-image: repeating-linear-gradient(45deg, #82abae, transparent 400px);';
			form_element.style.color = "gray";
		}

		const custom_plan = document.getElementById("custom_plan")
		if(custom_plan){
			custom_plan.style.backgroundColor = '#728156';
		}

		const dark_mode_btn = document.getElementById('dark_btn');
		if(dark_mode_btn){
			dark_mode_btn.innerHTML = `DARK MODE`;
		}

		const contact_page_container = document.getElementById("contact_page_container");
		if(contact_page_container){
			contact_page_container.style.backgroundColor = "transparent";
		}

		const section2 = document.getElementById("section2");
		if(section2){
			section2.classList.remove("dark_mode_on_cards");
			const cardParagraphs = document.querySelectorAll('#section2 .catcardmedia a p');
			cardParagraphs.forEach((element) => {
				if(element){
					element.style.color = "grey";
				}
			});

			ExploreHeading = document.querySelector("#section2 .sectionHeader h1");
			if(ExploreHeading){
				ExploreHeading.style.color = 'black';
			}

			BlogHeading = document.querySelector("#section3 .sectionHeader h1");
			if(BlogHeading){
				BlogHeading.style.color = 'black';
			}
		}
	}
}



document.addEventListener("DOMContentLoaded", async () => {
	const savedModalState = localStorage.getItem("modelState");

	if(savedModalState){

		const OldElement = document.getElementById('sign_up_box');
		if(OldElement){
			OldElement.remove();
		}

		const element = document.createElement('div');
		element.id = "sign_up_box";
		element.classList.add('border','bg-blue-700','text-shadow-lg','w-[calc(100%-1rem)]','sm:w-[90%]','max-w-3xl',
								'max-h-[calc(100dvh-1rem)]','sm:max-h-[calc(100dvh-3rem)]','fixed','inset-2','sm:inset-6',
								'z-[100]','rounded-2xl','backdrop-blur-md','flex','flex-col','items-center','justify-start',
								'overflow-y-auto','p-4','sm:p-8','text-base','sm:text-xl','font-semibold','transition-all',
								'transform', 'absolute', 'right-0',
							    '-translate-x-full', 'transition-transform', 'duration-500', 'ease-out');

        element.style.color = 'honeydew';
        element.style.backgroundImage = "repeating-linear-gradient(50deg, #311836, transparent 400px)";
        document.body.appendChild(element);
        document.body.classList.add('overflow-hidden');

        if(localStorage.getItem("darkMode") === "true"){
			element.classList.remove("bg-blue-700");
			element.classList.add("bg-black");
		}



        setTimeout(() => {
	        element.classList.remove('-translate-x-full', 'right-0', 'absolute');
	    }, 10);




        if (savedModalState === "main_features") {
            render_main_features(element);
        } else if (savedModalState === "sign_up_form") {
            renderSIGN_UP_FORM(element);
        }
	}

	const Is_Logged_In = localStorage.getItem("IsLogged");
	const nav_element = document.getElementById('main-nav');

	console.log("LOGIN STATUS:", Is_Logged_In);
	console.log("USERNAME:", localStorage.getItem("username"));

	const Profile_Pic_Upload = document.getElementById("Profile_Pic")
	const savedPic = localStorage.getItem('userProfilePic');
    if (savedPic && Profile_Pic_Upload) {
        Profile_Pic_Upload.style.backgroundImage = savedPic;
    }


    const response = await fetch('/api/crypto_id');
    const data = await response.json();

    console.log("Crypto ID:", data.username);


	if(Is_Logged_In === "Yes"){
		Profile_SetUp(localStorage.getItem("username"));
	}

	else{

		fetch('/api/current-user')
		    .then(response => response.json())
		    .then(data => {

		        if (data.username) {
		            localStorage.setItem("username", data.username);
		            localStorage.setItem("IsLogged", "Yes");
		            Profile_SetUp(data.username);
		        }

		    	else {

		            localStorage.removeItem("username");
		            localStorage.removeItem("IsLogged");
		        }
		    })
		    .catch(error => {
		        console.error("Could not check login:", error);
		    });

	}
});

document.addEventListener("click", (event)=> {
	const Profile_Box = document.getElementById('Profile_Box');
	if(Profile_Box && !Profile_Box.contains(event.target)){

		document.body.classList.add('overflow-x-hidden')
		setTimeout(() => {
	        Profile_Box.classList.add('translate-x-full', 'right-0');
	        // Profile_Box.classList.remove('right-40'); 
	    }, 10);

	    setTimeout(() => {
	    	Profile_Box.remove();
	    }, 2000);

	    setTimeout(() => {
	    	document.body.classList.remove("overflow-x-hidden");
	    }, 20000)
	}
});

const sign_up = document.getElementById('sign_up');

if(sign_up){
	sign_up.addEventListener('click', () => {

		const OldElement = document.getElementById('sign_up_box');
		if(OldElement){
			OldElement.remove();
		}

		const element = document.createElement('div');
		element.id = "sign_up_box";
		element.classList.add('border','bg-blue-700','text-shadow-lg','w-[calc(100%-1rem)]','sm:w-[90%]','max-w-3xl',
								'max-h-[calc(100dvh-1rem)]','sm:max-h-[calc(100dvh-3rem)]','fixed','inset-2','sm:inset-6',
								'z-[100]','rounded-2xl','backdrop-blur-md','flex','flex-col','items-center','justify-start',
								'overflow-y-auto','p-4','sm:p-8','text-base','sm:text-xl','font-semibold','transition-all',
								'transform',
							    '-translate-x-full', 'transition-transform', 'duration-500', 'ease-out');

		element.style.color = 'honeydew';
		element.style.backgroundImage = "repeating-linear-gradient(50deg, #311836, transparent 400px)";
		document.body.appendChild(element);
		document.body.classList.add('overflow-hidden');


		if(localStorage.getItem("darkMode") === "true"){
			element.classList.remove("bg-blue-700");
			element.classList.add("bg-black");
		}

        setTimeout(() => {
	        element.classList.remove('-translate-x-full', 'right-0', 'absolute');
	    }, 10);


		render_main_features(element);

	});
}


function render_main_features(element){
	element.innerHTML = `
			<h2 class="p-3 flex justify-center decoration-5 underline w-full ml-auto mr-auto mb-5">SIGN UP/SIGN IN FEATURES</h2>
			<p class="py-3 px-10 text-center w-full cursor-pointer ease-in-out ml-auto mr-auto mb-5">YOU CAN ACCESS YOUR PREVIOUSLY GENERATED TRAVEL ITINERARIES THROUGH PROFILE</p>
			<p class="py-3 px-10 text-center w-full cursor-pointer ease-in-out ml-auto mr-auto mb-5">YOU CAN CLICK OVER AN ACTIVITY TO KNOW ABOUT IT</p>
			<div class="flex items-center justify-center flex-wrap">
				<button id="create_user" class="p-4 border-3 rounded-2xl m-3 transition-colors hover:underline hover:bg-black hover:text-[lime] cursor-pointer transition-all">SIGN UP</button>
				<button id="google_sign_in" class="p-4 border-3 rounded-2xl m-3 transition-colors hover:underline hover:bg-black hover:text-[lime] cursor-pointer transition-all">LOGIN WITH GOOGLE</button>
			</div>

			<div id="cross_cancel" class="absolute top-0 right-0 p-2 m-2 rounded-2xl bg-black/20 cursor-pointer hover:bg-black/50">❌</div>
		`

	localStorage.setItem("modelState", "main_features");

	const cancel_by_cross = document.getElementById('cross_cancel');

	if(cancel_by_cross){
		cancel_by_cross.addEventListener('click', () => {
			localStorage.removeItem("modelState");

			setTimeout(() => {
		        element.classList.add('-translate-x-full', 'right-0', 'absolute');
		    }, 10);

		    setTimeout(() => {
		    	document.body.classList.remove('overflow-hidden');
		    	element.remove();
		    }, 500);

			
		});
	}


	const create_user = document.getElementById('create_user');

	if(create_user){
		create_user.addEventListener('click', () => {
			renderSIGN_UP_FORM(element);
		});
	}


	const google_sign_in = document.getElementById('google_sign_in');

	if (google_sign_in) {
		google_sign_in.addEventListener('click', () => {
			showLoader();
    		document.body.classList.remove('overflow-hidden');
			localStorage.removeItem("modelState");
			element.remove();

		    window.location.href = '/auth/google';
		});
	}
}


function renderSIGN_UP_FORM(element){
	let temp = element.innerHTML;
	element.innerHTML = `
		<div id="cross_cancel" class="absolute top-0 right-0 p-2 m-2 rounded-2xl bg-black/20 cursor-pointer hover:bg-black/50">❌</div>
		<h2 id="CREATE_NEW_USER" class="p-2 m-3 underline decoration-6 text-green-200 text-shadow-lg cursor-pointer transition-all hover:text-red-300 hover:bg-black/30 hover:p-2 hover:rounded-2xl">CREATE YOUR ACCOUNT</h2>
		<form id="sign_up_form" class="flex flex-col justify-center items-center w-full">
			<input type="text" id="username" class="p-2 border-2 m-3 w-full max-w-md hover:rounded-2xl transition-all rounded-xl hover:bg-black hover:font-bold focus:bg-black focus:font-bold focus:rounded-2xl" placeholder="ENTER YOUR USER NAME" required></input>
			<div class="flex flex-col justify-center items-center">
				<input type="password" id="password" class="p-2 border-2 m-3 w-full max-w-md hover:rounded-2xl transition-all rounded-xl hover:bg-black hover:font-bold focus:bg-black focus:font-bold focus:rounded-2xl" placeholder="ENTER YOUR PASSWORD" required></input>
				<span id="password_feedback"></span>
			</div>

			<button type="submit" id="submit_sign_up" class="cursor-pointer border-4 py-2 px-6 w-full max-w-xs mt-10 rounded-xl ease-out-in transition-all hover:rounded-full hover:italic hover:bg-purple-500">SUBMIT</button>
		</form>
	`

	localStorage.setItem('modelState', "sign_up_form")

	const cancel_by_cross = document.getElementById('cross_cancel');
	if(cancel_by_cross){
		cancel_by_cross.addEventListener('click', () => {
			localStorage.removeItem("modelState");

			setTimeout(() => {
		        element.classList.add('-translate-x-full', 'right-0', 'absolute');
		    }, 10);

		    setTimeout(() => {
		    	document.body.classList.remove('overflow-hidden');
		    	element.remove();
		    }, 500);
		});
	}

	const CREATE_NEW_USER = document.getElementById('CREATE_NEW_USER');
	if(CREATE_NEW_USER){
		CREATE_NEW_USER.addEventListener('click', () => {
			element.innerHTML = `
				<div id="cross_cancel" class="absolute top-0 right-0 p-2 m-2 rounded-2xl bg-black/20 cursor-pointer hover:bg-black/50">❌</div>
				<h2 id="ALREADY_HAVE" class="p-2 m-3 underline decoration-6 text-green-200 text-shadow-lg cursor-pointer transition-all hover:text-red-300 hover:bg-black/30 hover:p-2 hover:rounded-2xl">ALREADY HAVE A ACCOUNT?</h2>
				<form id="sign_up_form" class="flex flex-col justify-center items-center w-full">
					<input type="text" id="username" class="p-2 border-2 m-3 w-full max-w-md hover:rounded-2xl transition-all rounded-xl hover:bg-black hover:font-bold focus:bg-black focus:font-bold focus:rounded-2xl" placeholder="ENTER YOUR USER NAME" required></input>
					<span id="username_feedback"></span>
					<div class="flex flex-col justify-center items-center">
						<input type="password" class="p-2 border-2 m-3 w-full max-w-md hover:rounded-2xl transition-all rounded-xl hover:bg-black hover:font-bold focus:bg-black focus:font-bold focus:rounded-2xl" id="password" placeholder="CREATE NEW PASSWORD" required></input>
						<span id="password_feedback"></span>
					</div>

					<div>
						<input type="password" class="p-2 border-2 m-3 w-full max-w-md hover:rounded-2xl transition-all rounded-xl hover:bg-black hover:font-bold focus:bg-black focus:font-bold focus:rounded-2xl" id="re_password" placeholder="RE-ENTER NEW PASSWORD" required></input>
					</div>
					
					<button type="submit" class="cursor-pointer border-4 py-2 px-6 w-full max-w-xs mt-10 rounded-xl ease-out-in transition-all hover:rounded-full hover:italic hover:bg-purple-500" id="submit_new_user">SUBMIT</button>
				</form>
			`

			const cancel_by_cross = document.getElementById('cross_cancel');
			if(cancel_by_cross){
				cancel_by_cross.addEventListener('click', () => {
					localStorage.removeItem("modelState");
					setTimeout(() => {
				        element.classList.add('-translate-x-full', 'right-0', 'absolute');
				    }, 10);

				    setTimeout(() => {
				    	document.body.classList.remove('overflow-hidden');
				    	element.remove();
				    }, 500);
				});
			}

			const Already_Have = document.getElementById('ALREADY_HAVE');
			if(Already_Have){
				Already_Have.addEventListener('click', () => {
					renderSIGN_UP_FORM(element);
				});
			}

			const user = document.getElementById('username');
			const pass = document.getElementById('password');
			const re_pass = document.getElementById('re_password');
			const feedback = document.getElementById('password_feedback');
			const username_feedback = document.getElementById("username_feedback");

			user.addEventListener('input', async () => {
				const value = user.value;

				const duplicacy = await fetch(
					`/api/check_DBUSER?username=${encodeURIComponent(value)}`
				); 

				const data_duplicate = await duplicacy.json();
				if(data_duplicate.available){
					const username_feedback = document.getElementById("username_feedback");
					username_feedback.innerHTML = `USERNAME ALREADY TAKEN`;
					username_feedback.style.color = "#fca5a5";
				}
				else{
					const username_feedback = document.getElementById("username_feedback");
					username_feedback.innerHTML = `USERNAME UNIQUE`;
					username_feedback.style.color = "#86efac";
				}


				if(value.length < 3){
					username_feedback.innerHTML = '';
				}

			});

			pass.addEventListener('input', () => {
				const value = pass.value;
				if(value.length == 0){
					feedback.innerHTML = "";
				}
				else if(value.length >= 8 && /\d/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value)){
					feedback.innerHTML = "STRONG PASSWORD !";
					feedback.style.color = "#86efac";
				}
				else{
					feedback.innerHTML = "Weak: Must be 8+ characters, include a number & a special character.";
					feedback.style.color = "#fca5a5";
				}
			});

			const form = document.getElementById('sign_up_form');
			form.addEventListener('submit', async (e) => {
				e.preventDefault();

				if(feedback.style.color !== "rgb(134, 239, 172)" && feedback.style.color !== "#86efac"){
					alert("Please fix your password strength before submitting.");
            		return;
				}

				if(username_feedback.style.color !== "rgb(134, 239, 172)" && username_feedback.style.color !== "#86efac"){
					alert("Please fix your username before submitting. MUST BE MORE THAN 3 LETTERS AND UNIQUE");
            		return;
				}

				if(re_pass.value !== pass.value){
					alert("password re_entered doesn't matches with the original password");
					return;
				}

				//  ADDING THIS INTO DATABASEE
				try{

					showLoader();
					const response = await fetch('/api/signup', {
						method: 'post',
						headers:{
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							username: user.value,
							password: pass.value
						})
					});

					const data = await response.json();

					hideLoader();
					if(data.success){
						console.log("User Registered Successfully", {username: user.value, password: pass.value});
						alert("registration Successfull");
						renderSIGN_UP_FORM(element);
					} else{
						alert(data.message);
					}

				} catch(error){
					console.error("Network Error:", error);
					alert("Could not reach the backend server.");
				}


			});

		});
	}

	const form = document.getElementById('sign_up_form');
	if(form){
		form.addEventListener('submit', async (e) => {
			// CHECKING THE DATABASE WHETHER INFO EXISTS OR NOT 
			
			e.preventDefault();

			const username = document.getElementById("username");
			const password = document.getElementById("password");

 			try{

				const response = await fetch('/api/credentials', {
					method: 'post', 
					headers:{
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						username: username.value,
						password: password.value
					})
				});

				const data = await response.json();

				if(data.success){
					alert("LOGIN SUCCESSFULL");
					
					document.body.classList.remove('overflow-hidden');
					localStorage.removeItem("modelState");
					element.remove();

					localStorage.setItem("username", username.value);
					localStorage.setItem("IsLogged", "Yes");
					Profile_SetUp(username.value);

				} else{
					alert(data.message);
					username.value = '';
					password.value = '';
				}

			} catch(error){
				alert("Could not reach the backend API");
			}

		});
	}
}


function Profile_SetUp(username){
	const nav_bar = document.getElementById('main-nav');
	const profile = nav_bar.querySelector("#profile_up")
	profile.innerHTML = '';
	profile.style.background = "url('/images/default_profile.jpg') center/cover no-repeat";
	profile.classList.remove('hidden');
	nav_bar.querySelector('#sign_up').classList.add('hidden');
	

	profile.addEventListener("click", (event) => {

		event.stopPropagation();
		const Old_Profile_Box = document.getElementById('Profile_Box');
		if(Old_Profile_Box){
			Old_Profile_Box.remove();
		}

		// HERE WE ARE DESIGNING THE PROFILE THING

		document.body.classList.add("overflow-x-hidden");
		const Profile_Box = document.createElement('div');
		Profile_Box.id = 'Profile_Box';
		Profile_Box.classList.add(
							    'border-8', 'w-[75%]', 'sm:w-[50%]', 'lg:w-[25%]', 'fixed', 'right-0', 'z-[100]', 'top-23', 'rounded-2xl',
							    'p-4', 'bg-blue-400/80', 'font-semibold', 'text-white', 'flex', 'flex-col', 'items-center',
							    'shadow-xl', 'shadow-indigo-500/50', 'transform',
							    'translate-x-full', 'transition-transform', 'duration-500', 'ease-out'
							);

	    setTimeout(() => {
	        Profile_Box.classList.remove('translate-x-full', 'right-0');
	        // Profile_Box.classList.add('right-40'); 
	    }, 10);

	    setTimeout(() => {
	    	document.body.classList.remove("overflow-x-hidden");
	    }, 1000);


		Profile_Box.innerHTML = `
			<div id="Profile_Pic" class="bg-no-repeat bg-cover cursor-pointer bg-center rounded-full flex items-center justify-center w-[45%] h-30" style="background-image: url('/images/default.jpg');"> 
				ADD UR PROFILE PIC 
				<input type="file" id="profile_input" accept="image/*" style="display: none;">
			</div>
			
			<h2 id="Profile_Name" class="m-2 border-3 p-2 cursor-pointer transition-all hover:rounded-2xl hover:font-bold hover:bg-purple-600 hover:text-white">USERNAME : ${username}</h2>
			<button id="Saved_Itineraries" class="m-2 p-3 border-4 cursor-pointer transition-all hover:rounded-2xl hover:font-bold hover:bg-purple-600 hover:text-white">ITINERARIES</button>
			<button id="sign_out" class="m-2 p-2 border-3 cursor-pointer transition-all hover:rounded-2xl hover:font-bold hover:bg-purple-600 hover:text-white">SIGN OUT</button>
			<div id="close_profile_box" class="absolute top-0 right-2 text-4xl cursor-pointer text-red-300 transition-all hover:text-white">&times;</div>
		`

		document.body.appendChild(Profile_Box);

		const close_profile_box = document.getElementById("close_profile_box");
		if(close_profile_box){
			close_profile_box.addEventListener("click", () => {
				
				document.body.classList.add('overflow-x-hidden')
				setTimeout(() => {
			        Profile_Box.classList.add('translate-x-full', 'right-0');
			        // Profile_Box.classList.remove('right-40'); 
			    }, 10);

			    setTimeout(() => {
			    	Profile_Box.remove();
			    }, 2000);

			    setTimeout(() => {
			    	document.body.classList.remove("overflow-x-hidden");
			    }, 20000)

				
			});
		}

		const Profile_Pic_Upload = document.getElementById("Profile_Pic");
		const profile_input = document.getElementById("profile_input");

		if (Profile_Pic_Upload) {
		    Profile_Pic_Upload.addEventListener('click', () => {
		        profile_input.click();
		    });

		    profile_input.addEventListener('change', (event) => {
		        const file = event.target.files[0];
		        
		        // Check if a file was actually selected (handles user cancelling the picker)
		        if (file) {
		            const reader = new FileReader(); // 1. FIXED: Created the reader instance

		            reader.onload = function(e) { // 2. FIXED: Changed 'render' to 'reader'
		                const image = e.target.result;
		                Profile_Pic_Upload.style.backgroundImage = `url('${image}')`;
		                localStorage.setItem("userProfilePic", image);
		            };

		            reader.readAsDataURL(file); // 3. FIXED: Added this line to start reading the file
		        }
		    });
		}

		const Saved_Itineraries_btn = Profile_Box.querySelector("#Saved_Itineraries");
		if(Saved_Itineraries_btn){
			Saved_Itineraries_btn.addEventListener("click", async () => {

				const OldContainer = document.getElementById('container_itineraries');
				if(OldContainer){
					OldContainer.remove();
				}

				try{
					showLoader();
					const response = await fetch(
						    `/api/get_itineraries?username=${encodeURIComponent(localStorage.getItem("username"))}`
						);
					console.log("HTTP STATUS:", response.status);
					const data = await response.json();
					console.log("ITINERARIES RECEIVED:", data);

					if(!data.itineraries){
						console.log("NOT HERE");
					}

					const All_Itineraries = data.itineraries.map((Itinerary) => {

						const itineraryHTML = Itinerary.A_Bunch.map((day, index) => {
						    const activitiesHTML = day.map((activity) => {

						    	const img = activity.image || '/images/default.jpg';

						    	return `
						    	<div>
							        <div 
							            class="m-3 flex flex-col justify-center items-center rounded-2xl cursor-pointer 
							                   bg-cover bg-center h-52 sm:h-64 p-5
							                   hover:shadow-xl/30 hover:shadow-indigo-500/50 
							                   hover:ring-4 hover:text-shadow-lg/30 hover:bg-blend-overlay"
							            data-name="${activity.name}" 
							            onclick="openActivity('${activity.name}', '${img}')" 
							            style="background-image: url('${img}'); background-size: cover;"
							        >
							        </div>
									<div style="background-image: repeating-linear-gradient(45deg, black, transparent 500px);" class="rounded-2xl flex flex-col items-center text-center">
							            <h3 class="rounded-2xl p-2 text-white font-semibold text-shadow-lg" font-weight: 600; color: #3b1f6a;>PLACE NAME : ${activity.name}</h3>
							            <p class="rounded-2xl p-2 text-white font-semibold text-shadow-lg text-[#9426ff]" style="font-weight: 1000;">TIME : ${activity.time}</p>
							            <p class="rounded-2xl p-2 text-white font-semibold text-shadow-lg text-[#1d4559]" style="font-weight: 800;">TYPE OF PLACE : ${activity.category}</p>
							        </div>
						         </div>

						    `}).join('');

						    return `
						        <div class="col-span-3">

						            <h2 class="text-4xl p-5">
						                DAY ${index+1}
						            </h2>

						            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						                ${activitiesHTML}
						            </div>

						        </div>
						    `;

						}).join('');

						return `

				            <h2 class="text-4xl p-2 text-center mt-20">
				            	THIS ITINERARY WAS CREATED ON ${Itinerary.Date}
				            </h2>
							<h2 class="text-4xl p-2 text-center">
				                ${Itinerary.Destination}
				            </h2>

				            <h2 class="text-4xl p-5 text-center">
				                ${Itinerary.Weather}
				            </h2>
				            
							${itineraryHTML}
						`

					}).join('');

					const container = document.createElement('div');
					container.id = "container_itineraries";
					container.style.backgroundImage = "repeating-linear-gradient(45deg, #46ac8e, transparent 800px);"
					container.style.fontFamily = 'monospace';

					container.classList.add('fixed', 'bg-slate-300', 'flex', 'flex-col', 'h-[95vh]', 'overflow-y-auto', 
											'w-full', 'z-[100]', 'rounded-[50px]', 'p-3', 'm-3', 'translate-x-full', 'transition-transform',
											'transform', 'duration-500', 'ease-out');


					container.innerHTML = All_Itineraries;
					document.body.appendChild(container);

					setTimeout(() => {
						container.classList.remove('translate-x-full');
					}, 10);
					
					const close_container = document.createElement('div');
					close_container.classList.add('fixed', 'right-10', 'top-10', 'text-[50px]', 'font-semibold',
													'hover:text-red-400', 'cursor-pointer', 'bg-black/40', 'text-white', 
													'px-3', 'rounded-2xl', 'hover:bg-green-600', 'transition-all');
					close_container.innerHTML = '&times';
					document.getElementById('container_itineraries').appendChild(close_container);

					close_container.addEventListener("click", () => {
						container.classList.add('translate-x-full');
						setTimeout(() => {
							container.remove();
						}, 1000);
					});



				} catch(error){
					console.log("Error recieved from get itineraries ");
					console.log(error);
				}
				finally{
					hideLoader();
				}

			});
		}


		const sign_out = document.getElementById('sign_out');
		sign_out.addEventListener('click', () => {
			localStorage.setItem("IsLogged", "No");
			profile.classList.add('hidden');
			let temp = document.getElementById('container_itineraries');
			if(temp){
				temp.remove();
			}


			document.body.classList.add('overflow-x-hidden')
			setTimeout(() => {
		        Profile_Box.classList.add('translate-x-full', 'right-0');
		        // Profile_Box.classList.remove('right-40'); 
		    }, 10);

		    setTimeout(() => {
		    	Profile_Box.remove();
		    }, 2000);

		    setTimeout(() => {
		    	document.body.classList.remove("overflow-x-hidden");
		    }, 20000)

		    window.location.href = '/logout';

			nav_bar.querySelector('#sign_up').classList.remove('hidden');
		});
	});

}




function openActivity(name, image_url) {

    showLoader();
   	window.location.href = `/activity/${encodeURIComponent(name)}?image_url=${encodeURIComponent(image_url)}`;
   	setTimeout(() => {
        hideLoader();
    }, 5000);
}


function openBlog(name) {

    showLoader();
	window.location.href = `/blog/${encodeURIComponent(name)}`;

	setTimeout(() => {
        hideLoader();
    }, 5000);
}


function showLoader() {
    const loader = document.getElementById('loader');

    if (!loader) return;

    loader.classList.remove('hidden');

    document.body.classList.add('overflow-hidden');
    document.body.classList.add('page-disabled');
}

function hideLoader() {
    const loader = document.getElementById('loader');

    if (!loader) return;

    loader.classList.add('hidden');

    document.body.classList.remove('overflow-hidden');
    document.body.classList.remove('page-disabled');
}


window.addEventListener('scroll', () => {
	const nav = document.getElementById('main-nav');
	const dark_mode = document.getElementById('dark_btn');
	const Profile_Box = document.getElementById('Profile_Box');

	if (!nav || !dark_mode) return;

	if(dark_mode.innerHTML != "LIGHT MODE"){
		if(window.scrollY > 50){
			nav.style.backgroundColor = "#E7F5DC";
			nav.style.color = 'black';
			nav.classList.remove('rounded-2xl');
		}else{
			nav.style.backgroundColor = '#728156';
			nav.style.color = "white";
			nav.classList.add('rounded-2xl');
		}
	}
	else{
		if(window.scrollY > 50){
			nav.style.backgroundColor = "black";
		}else{
			nav.style.backgroundColor = 'rgb(6, 20, 27)';
		}
	}

	if(Profile_Box){
		document.body.classList.add('overflow-x-hidden')
		setTimeout(() => {
	        Profile_Box.classList.add('translate-x-full', 'right-0');
	        // Profile_Box.classList.remove('right-40'); 
	    }, 10);

	    setTimeout(() => {
	    	Profile_Box.remove();
	    }, 2000);

	    setTimeout(() => {
	    	document.body.classList.remove("overflow-x-hidden");
	    }, 20000)

		
	}
});


const destination = document.getElementById("destination");
const suggestions = document.getElementById("suggestions");

if(destination){
	destination.addEventListener('input', async () => {
		const query = destination.value.trim();

		if(query.length < 2){
			suggestions.classList.add('hidden');
			return;
		}

		try{

			const response = await fetch(
				`/api/search-place?query=${encodeURIComponent(query)}`
			);

			const data = await response.json();

			suggestions.innerHTML = "";

			if(!data.results || data.results.length == 0){
				suggestions.classList.add('hidden');
				return;
			}

			data.results.forEach(place => {

				const option = document.createElement('div');
				option.classList.add("cursor-pointer", "hover:bg-blue-400", "hover:text-white", "hover:font-bold", "transition-all");
				option.textContent = [
				    place.name,
				    place.admin1,
				    place.country
				].filter(Boolean).join(', ');

				option.addEventListener('click', () => {

					destination.value = `${place.name}, ${place.country}`;
					suggestions.classList.add('hidden');

				});

				suggestions.appendChild(option);

			});

			suggestions.classList.remove('hidden');
		} catch(error){
			console.error('suggestions error ', error);
		}
	});
}

const submit_btn = document.getElementById('submit_btn');

if(submit_btn){
	submit_btn.addEventListener('click', () => {
		
		const submit_text = document.getElementById('submit_text');
		const loader = document.getElementById('loader');


		submit_btn.disabled = true;
		submit_text.textContent = "Generating...";
		showLoader();

	    const current_location =
	        document.getElementById("location").value;

	    const destination =
	        document.getElementById("destination").value;

	    const persona =
	        document.getElementById("persona").value;

	    const duration = 
	    	document.getElementById("duration").value;


	    console.log("Sending:", {
	        current_location,
	        destination,
	        persona,
	        duration
	    });


	    let username_available = "-1";
	    console.log("HERE HERE ", localStorage.getItem("username"));
	    if(localStorage.getItem("username")){
	    	username_available = localStorage.getItem("username");
	    }

	    fetch('/api/generate-itinerary', {

	        method: 'POST',

	        headers: {
	            'Content-Type': 'application/json'
	        },

	        body: JSON.stringify({
	        	username_available,
	            current_location,
	            destination,
	            persona,
	            duration
	        })

	    })

	    .then(res => {

	        console.log("HTTP status:", res.status);

	        return res.json();

	    })

	    .then(data => {

	        console.log("Backend response:", data);

	        const results = document.getElementById('results');
	        const Headers = document.getElementById('Headers');
	        Headers.classList.add("text-white", 'text-shadow-lg');

	        if (data.error) {
	            hideLoader();
	            alert(data.error);
	            submit_btn.disabled = false;
				submit_text.textContent = "Submit";
				Headers.style.backgroundColor = "transparent";
	            return;
	        }

	        console.log("SUCCESS:", data);

	        Headers.innerHTML = `
	        	<h2>${data.destination} is ${data.weather}&deg</h2>
	        	<h2>${data.persona} Oriented Activities Are As Shown</h2>
	        `;

	        Headers.style.backgroundColor = "#97c9c3";


	        const itineraryHTML = data.itinerary.map((day, index) => {
			    const activitiesHTML = day.map((activity) => {

			    	const img = activity.image || '/images/default.jpg';

			    	return `
			    	<div class="flex flex-col">
				        <div 
				            class="m-3 flex flex-col justify-center items-center rounded-2xl cursor-pointer 
				                   bg-cover bg-center h-52 sm:h-64 p-5
				                   hover:shadow-xl/30 hover:shadow-indigo-500/50 
				                   hover:ring-4 hover:text-shadow-lg/30 hover:bg-blend-overlay"
				            data-name="${activity.name}" 
				            onclick="openActivity('${activity.name}', '${img}')" 
				            style="background-image: url('${img}'); background-size: cover;"
				        >
				        </div>
				        <div style="background-image: repeating-linear-gradient(45deg, black, transparent 500px);" class="rounded-2xl flex flex-col items-center text-center">
				            <h3 class="rounded-2xl p-2 text-white font-semibold text-shadow-lg" font-weight: 600; color: #3b1f6a;>PLACE NAME : ${activity.name}</h3>
							<p class="rounded-2xl p-2 text-white font-semibold text-shadow-lg text-[#9426ff]" style="font-weight: 1000;">TIME : ${activity.time}</p>
							<p class="rounded-2xl p-2 text-white font-semibold text-shadow-lg text-[#1d4559]" style="font-weight: 800;">TYPE OF PLACE : ${activity.category}</p>
				        </div>
				    </div>

			    `}).join('');

			    return `
			        <div class="col-span-3">

			            <h2 class="text-4xl p-5">
			                DAY ${index+1}
			            </h2>

			            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			                ${activitiesHTML}
			            </div>

			        </div>
			    `;

			}).join('');

			results.innerHTML = itineraryHTML;
			results.style.backgroundImage = "repeating-linear-gradient(45deg, #46ac8e, transparent 800px);"
			results.style.fontFamily = 'monospace';
			submit_btn.disabled = false;
			submit_text.textContent = "Submit";


			hideLoader();

	    })

	    .catch(error => {

	        console.error("Fetch error:", error);
	        submit_btn.disabled = false;
			submit_text.textContent = "Submit";
			Headers.style.backgroundColor = "transparent";
			hideLoader();

	    });

	});
}