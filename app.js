import { initializeApp }
from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    deleteDoc,
    doc
}
from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// ====================================
// FIREBASE
// ====================================

// CONFIG FIREBASE

const firebaseConfig = {

    apiKey: "AIzaSyDwvO4RqqoUrqGlYyWc9dPxW_ksKODIids",

    authDomain: "talento-arpy.firebaseapp.com",

    projectId: "talento-arpy",

    storageBucket: "talento-arpy.firebasestorage.app",

    messagingSenderId: "349365769484",

    appId: "1:349365769484:web:079d32c322cd1280e3e529"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const provider =
    new GoogleAuthProvider();

let currentUser = null;

//
const loginBtn =
    document.getElementById(
        "loginBtn"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

loginBtn.addEventListener(
    "click",
    async () => {

        try{

            await signInWithPopup(
                auth,
                provider
            );

        }catch(error){

            console.error(error);

        }

    }
);

onAuthStateChanged(
    auth,
    (user) => {

        if(user){

            currentUser = user;

            loginBtn.style.display =
                "none";

            logoutBtn.style.display =
                "inline-block";

            console.log(
                "Usuario logueado:",
                user.email
            );

        }else{

            currentUser = null;

            loginBtn.style.display =
                "inline-block";

            logoutBtn.style.display =
                "none";

        }

        loadProfiles();

    }
);

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(error);

        }

    }
);
//



// ====================================
// ELEMENTOS
// ====================================

const profileForm =
    document.getElementById("profileForm");

const profilesContainer =
    document.getElementById("profilesContainer");

const searchInput =
    document.getElementById("searchInput");

const areaFilter =
    document.getElementById("areaFilter");

const countryFilter =
    document.getElementById("countryFilter");

const talentCount =
    document.getElementById("talentCount");

let allProfiles = [];


// ====================================
// GUARDAR PERFIL
// ====================================

profileForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        try {

            let linkedin =
                document
                .getElementById("linkedin")
                .value
                .trim();

            if (
                !linkedin.startsWith("http://") &&
                !linkedin.startsWith("https://")
            ) {

                linkedin =
                    "https://" + linkedin;

            }

if (!currentUser) {

    alert(
        "Debes iniciar sesión con Google para publicar un perfil."
    );

    return;

}

const newProfile = {

    uid:
        currentUser.uid,

    email:
        currentUser.email,

    ownerName:
        currentUser.displayName,

    name:
        document.getElementById("name").value,

    country:
        document.getElementById("country").value,

    area:
        document.getElementById("area").value,

    position:
        document.getElementById("position").value,

    location:
        document.getElementById("location").value,

    experience:
        document.getElementById("experience").value,

    linkedin:
        linkedin,

    summary:
        document.getElementById("summary").value,

    skills:
        document.getElementById("skills").value,

    active:
        true,

    createdAt:
        new Date()

};

            await addDoc(

                collection(
                    db,
                    "profiles"
                ),

                newProfile

            );

            alert(
                "✅ Perfil publicado correctamente"
            );

            profileForm.reset();

            loadProfiles();

        } catch (error) {

            console.error(error);

            alert(
                "❌ Error al publicar perfil"
            );

        }

    }
);


// ====================================
// CARGAR PERFILES
// ====================================

async function loadProfiles() {

    try {

        const q = query(

            collection(
                db,
                "profiles"
            ),

            orderBy(
                "createdAt",
                "desc"
            )

        );

        const snapshot =
            await getDocs(q);

        allProfiles = [];

        snapshot.forEach(doc => {

const profile = {

    id: doc.id,

    ...doc.data()

};

if(profile.active !== false){

    allProfiles.push(profile);

}

        });

        // TALENTOS

        const totalTalentos =
            allProfiles.length;

        talentCount.textContent =
            totalTalentos;

        const counterHeader =
            document.getElementById(
                "talentCountHeader"
            );

        if(counterHeader){

            counterHeader.textContent =
                totalTalentos;

        }

        // ÁREAS

        const uniqueAreas =
            [...new Set(

                allProfiles
                    .map(profile =>
                        profile.area
                    )
                    .filter(Boolean)

            )];

        const areasCount =
            document.getElementById(
                "areasCount"
            );

        if(areasCount){

            areasCount.textContent =
                uniqueAreas.length;

        }

        // OPORTUNIDADES

        const opportunities =
            document.getElementById(
                "opportunitiesCount"
            );

        if(opportunities){

            opportunities.textContent =
                totalTalentos + "+";

        }

        renderProfiles(allProfiles);

    } catch(error){

        console.error(error);

    }

}


// ====================================
// RENDER
// ====================================

function renderProfiles(profiles){

    profilesContainer.innerHTML = "";

    if(profiles.length === 0){

        profilesContainer.innerHTML =

        `
        <p>
            No se encontraron perfiles.
        </p>
        `;

        return;
    }

    profiles.forEach(profile => {

        const isOwner =

    currentUser

    &&

    profile.uid

    &&

    profile.uid === currentUser.uid;

        let skillsHTML = "";

        if(profile.skills){

            profile.skills
                .split(",")
                .forEach(skill => {

                    skillsHTML +=

                    `
                    <span class="skill-tag">

                        ${skill.trim()}

                    </span>
                    `;

                });

        }

        profilesContainer.innerHTML +=

        `
        <div class="profile-card">

            <div class="profile-header">

                <div class="avatar">

                    ${profile.name.charAt(0)}

                </div>

                <div>

                    <h3>
                        ${profile.name}
                    </h3>

                    <span class="area-badge">

                        ${profile.area || ""}

                    </span>

                </div>

            </div>

            <p>
                <strong>País:</strong>
                ${profile.country || ""}
            </p>

            <p>
                <strong>Puesto:</strong>
                ${profile.position || ""}
            </p>

            <p>
                <strong>Ubicación:</strong>
                ${profile.location || ""}
            </p>

            <p>
                <strong>Experiencia:</strong>
                ${profile.experience || 0}
                años
            </p>

            <p>

                ${profile.summary
    ? profile.summary.substring(0, 90) + "..."
    : ""
}

            </p>

            <div
                class="skills-container"
            >

                ${skillsHTML}

            </div>

            <a

                href="${profile.linkedin}"

                target="_blank"

                class="linkedin-btn"

            >

                Ver LinkedIn

                
            </a>

            ${isOwner ? `

<button
    class="remove-profile-btn"
    onclick="removeProfile('${profile.id}')"
>

    ✅ Conseguí trabajo

</button>

` : ""}

        </div>
        `;

    });

}


// ====================================
// FILTROS
// ====================================

function applyFilters(){

    const search =

        searchInput
            .value
            .toLowerCase();

    const selectedArea =
        areaFilter.value;

    const selectedCountry =
        countryFilter.value;

    const filtered =

        allProfiles.filter(profile => {

            const matchesSearch =

                profile.name
                    .toLowerCase()
                    .includes(search)

                ||

                profile.position
                    .toLowerCase()
                    .includes(search)

                ||

                profile.skills
                    .toLowerCase()
                    .includes(search);

            const matchesArea =

                selectedArea === "all"

                ||

                profile.area === selectedArea;

            const matchesCountry =

                selectedCountry === "all"

                ||

                profile.country === selectedCountry;

            return (

                matchesSearch

                &&

                matchesArea

                &&

                matchesCountry

            );

        });

    renderProfiles(filtered);

}


searchInput.addEventListener(
    "input",
    applyFilters
);

areaFilter.addEventListener(
    "change",
    applyFilters
);

countryFilter.addEventListener(
    "change",
    applyFilters
);


// ====================================
// MODO OSCURO
// ====================================

document
.getElementById("themeBtn")
.addEventListener(
    "click",
    () => {

        document.body
            .classList
            .toggle("dark");

    }
);


// ====================================
// NAVEGACIÓN
// ====================================

const navButtons =
    document.querySelectorAll(
        ".nav-btn"
    );

const pages =
    document.querySelectorAll(
        ".page"
    );

navButtons.forEach(btn => {

    btn.addEventListener(
        "click",
        () => {

            const section =
                btn.dataset.section;

            if(!section){
                return;
            }

            pages.forEach(page => {

                page.classList.remove(
                    "active-page"
                );

            });

            document
                .getElementById(
                    section
                )
                .classList.add(
                    "active-page"
                );

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

});


// ====================================
// MENU HAMBURGUESA
// ====================================

const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const navLinks =
    document.getElementById(
        "navLinks"
    );

if(menuToggle){

    menuToggle.addEventListener(
        "click",
        () => {

            navLinks.classList.toggle(
                "active-menu"
            );

            if(

                navLinks.classList.contains(
                    "active-menu"
                )

            ){

                menuToggle.innerHTML =
                    "✕";

            }else{

                menuToggle.innerHTML =
                    "☰";

            }

        }
    );

}


// CERRAR MENU AL NAVEGAR

document
.querySelectorAll(".nav-btn")
.forEach(btn => {

    btn.addEventListener(
        "click",
        () => {

            if(navLinks){

                navLinks.classList.remove(
                    "active-menu"
                );

            }

            if(menuToggle){

                menuToggle.innerHTML =
                    "☰";

            }

        }
    );

});


// ====================================
// INICIO
// ====================================

window.removeProfile =
async function(profileId){

    const confirmDelete = confirm(

        "¿Deseas ocultar tu perfil porque ya conseguiste trabajo?"

    );

    if(!confirmDelete){

        return;

    }

    try{

        await deleteDoc(

            doc(
                db,
                "profiles",
                profileId
            )

        );

        loadProfiles();

        alert(
            "Perfil eliminado correctamente"
        );

    }catch(error){

        console.error(error);

        alert(
            "Error al eliminar perfil"
        );

    }

}

loadProfiles();