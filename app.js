import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// ====================================
// CONFIGURACIÓN FIREBASE
// ====================================

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

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});


// ====================================
// ESTADO GLOBAL
// ====================================

let currentUser = null;

let allProfiles = [];

let editingProfileId = null;


// ====================================
// ELEMENTOS DEL HTML
// ====================================

const loginBtn =
    document.getElementById("loginBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const profileForm =
    document.getElementById("profileForm");

const profileFormTitle =
    document.getElementById("profileFormTitle");

const profileSubmitBtn =
    document.getElementById("profileSubmitBtn");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

const profilesContainer =
    document.getElementById("profilesContainer");

const myProfileContainer =
    document.getElementById("myProfileContainer");

const searchInput =
    document.getElementById("searchInput");

const areaFilter =
    document.getElementById("areaFilter");

const countryFilter =
    document.getElementById("countryFilter");

const talentCount =
    document.getElementById("talentCount");

const menuCrearPerfil =
    document.getElementById("menuCrearPerfil");

const menuMiPerfil =
    document.getElementById("menuMiPerfil");

const heroCrearPerfil =
    document.getElementById("heroCrearPerfil");

const heroMiPerfil =
    document.getElementById("heroMiPerfil");

const menuToggle =
    document.getElementById("menuToggle");

const navLinks =
    document.getElementById("navLinks");

const themeBtn =
    document.getElementById("themeBtn");

const navButtons =
    document.querySelectorAll(".nav-btn");

const pages =
    document.querySelectorAll(".page");


// ====================================
// FUNCIONES AUXILIARES
// ====================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function normalizeText(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase();

}


function normalizeLinkedInUrl(value) {

    let linkedin = String(value ?? "").trim();

    if (!linkedin) {
        return "";
    }

    if (
        !linkedin.startsWith("http://") &&
        !linkedin.startsWith("https://")
    ) {
        linkedin = "https://" + linkedin;
    }

    try {

        const url = new URL(linkedin);

        if (
            url.protocol !== "https:" &&
            url.protocol !== "http:"
        ) {
            return "";
        }

        return url.href;

    } catch {

        return "";

    }

}


function safeLinkedInUrl(value) {

    return normalizeLinkedInUrl(value) || "#";

}


function getStatusClass(status) {

    return normalizeText(
        status || "Disponible"
    )
        .replaceAll(" ", "-");

}


function getCurrentUserProfile() {

    if (!currentUser) {
        return null;
    }

    return allProfiles.find(
        profile =>
            profile.uid === currentUser.uid
    ) || null;

}


function getSkillsHtml(skillsValue) {

    return String(skillsValue ?? "")
        .split(",")
        .map(skill => skill.trim())
        .filter(Boolean)
        .map(skill => `
            <span class="skill-tag">
                ${escapeHtml(skill)}
            </span>
        `)
        .join("");

}


// ====================================
// NAVEGACIÓN
// ====================================

function showPage(sectionId) {

    const targetPage =
        document.getElementById(sectionId);

    if (!targetPage) {
        return;
    }

    pages.forEach(page => {
        page.classList.remove("active-page");
    });

    targetPage.classList.add("active-page");

    if (sectionId === "miPerfil") {
        renderMyProfile();
    }

    if (navLinks) {
        navLinks.classList.remove("active-menu");
    }

    if (menuToggle) {

        menuToggle.textContent = "☰";

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


navButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const section =
                button.dataset.section;

            if (!section) {
                return;
            }

            showPage(section);

        }
    );

});


// ====================================
// MENÚ HAMBURGUESA
// ====================================

if (menuToggle && navLinks) {

    menuToggle.addEventListener(
        "click",
        () => {

            const menuIsOpen =
                navLinks.classList.toggle(
                    "active-menu"
                );

            menuToggle.textContent =
                menuIsOpen ? "✕" : "☰";

            menuToggle.setAttribute(
                "aria-expanded",
                String(menuIsOpen)
            );

        }
    );

}


// ====================================
// MENÚ DINÁMICO DE PERFIL
// ====================================

function updateProfileMenu() {

    const myProfile =
        getCurrentUserProfile();

    if (!currentUser) {

        if (menuCrearPerfil) {
            menuCrearPerfil.hidden = true;
        }

        if (menuMiPerfil) {
            menuMiPerfil.hidden = true;
        }

        if (heroCrearPerfil) {
            heroCrearPerfil.hidden = true;
        }

        if (heroMiPerfil) {
            heroMiPerfil.hidden = true;
        }

        return;

    }

    if (myProfile) {

        if (menuCrearPerfil) {
            menuCrearPerfil.hidden = true;
        }

        if (menuMiPerfil) {
            menuMiPerfil.hidden = false;
        }

        if (heroCrearPerfil) {
            heroCrearPerfil.hidden = true;
        }

        if (heroMiPerfil) {
            heroMiPerfil.hidden = false;
        }

    } else {

        if (menuCrearPerfil) {
            menuCrearPerfil.hidden = false;
        }

        if (menuMiPerfil) {
            menuMiPerfil.hidden = true;
        }

        if (heroCrearPerfil) {
            heroCrearPerfil.hidden = false;
        }

        if (heroMiPerfil) {
            heroMiPerfil.hidden = true;
        }

    }

}


// ====================================
// AUTENTICACIÓN
// ====================================

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        async () => {

            try {

                await signInWithPopup(
                    auth,
                    provider
                );

            } catch (error) {

                console.error(
                    "Error al iniciar sesión:",
                    error
                );

                if (
                    error.code ===
                    "auth/popup-closed-by-user"
                ) {
                    return;
                }

                if (
                    error.code ===
                    "auth/unauthorized-domain"
                ) {

                    alert(
                        "Este dominio no está autorizado en Firebase Authentication."
                    );

                    return;

                }

                alert(
                    "No se pudo iniciar sesión con Google."
                );

            }

        }
    );

}


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                resetProfileForm();

                showPage("inicio");

            } catch (error) {

                console.error(
                    "Error al cerrar sesión:",
                    error
                );

                alert(
                    "No se pudo cerrar la sesión."
                );

            }

        }
    );

}


onAuthStateChanged(
    auth,
    async user => {

        currentUser = user || null;

        if (currentUser) {

            if (loginBtn) {
                loginBtn.hidden = true;
            }

            if (logoutBtn) {
                logoutBtn.hidden = false;
            }

        } else {

            if (loginBtn) {
                loginBtn.hidden = false;
            }

            if (logoutBtn) {
                logoutBtn.hidden = true;
            }

        }

        await loadProfiles();

    }
);


// ====================================
// CARGAR PERFILES
// ====================================

async function loadProfiles() {

    try {

        if (profilesContainer) {

            profilesContainer.innerHTML = `
                <p class="loading">
                    Cargando perfiles...
                </p>
            `;

        }

        const profilesQuery = query(
            collection(db, "profiles"),
            orderBy("createdAt", "desc")
        );

        const snapshot =
            await getDocs(profilesQuery);

        allProfiles = [];

        snapshot.forEach(documentSnapshot => {

            const profile = {
                id: documentSnapshot.id,
                ...documentSnapshot.data()
            };

            if (profile.active !== false) {
                allProfiles.push(profile);
            }

        });

        updateStatistics();

        renderProfiles(allProfiles);

        updateProfileMenu();

        renderMyProfile();

    } catch (error) {

        console.error(
            "Error al cargar perfiles:",
            error
        );

        if (profilesContainer) {

            profilesContainer.innerHTML = `
                <p class="empty-state">
                    No se pudieron cargar los perfiles.
                </p>
            `;

        }

    }

}


// ====================================
// ESTADÍSTICAS
// ====================================

function updateStatistics() {

    const totalProfiles =
        allProfiles.length;

    if (talentCount) {
        talentCount.textContent =
            totalProfiles;
    }

    const talentCountHeader =
        document.getElementById(
            "talentCountHeader"
        );

    if (talentCountHeader) {

        talentCountHeader.textContent =
            totalProfiles;

    }

    const uniqueAreas = [
        ...new Set(
            allProfiles
                .map(profile => profile.area)
                .filter(Boolean)
        )
    ];

    const areasCount =
        document.getElementById(
            "areasCount"
        );

    if (areasCount) {

        areasCount.textContent =
            uniqueAreas.length;

    }

    const opportunitiesCount =
        document.getElementById(
            "opportunitiesCount"
        );

    if (opportunitiesCount) {

        opportunitiesCount.textContent =
            `${totalProfiles}+`;

    }

}


// ====================================
// RENDERIZAR TODOS LOS PERFILES
// ====================================

function renderProfiles(profiles) {

    if (!profilesContainer) {
        return;
    }

    profilesContainer.innerHTML = "";

    if (profiles.length === 0) {

        profilesContainer.innerHTML = `
            <p class="empty-state">
                No se encontraron perfiles.
            </p>
        `;

        return;

    }

    profiles.forEach(profile => {

        const status =
            profile.status || "Disponible";

        const skillsHtml =
            getSkillsHtml(profile.skills);

        const shortSummary =
            String(profile.summary ?? "");

        const visibleSummary =
            shortSummary.length > 110
                ? shortSummary.substring(0, 110) + "..."
                : shortSummary;

        profilesContainer.insertAdjacentHTML(
            "beforeend",
            `
            <article class="profile-card">

                <div class="profile-header">

                    <div class="avatar">
                        ${escapeHtml(
                            String(
                                profile.name || "T"
                            )
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </div>

                    <div class="profile-title-block">

                        <h3>
                            ${escapeHtml(
                                profile.name || ""
                            )}
                        </h3>

                        <div class="profile-badges">

                            <span class="area-badge">
                                ${escapeHtml(
                                    profile.area || ""
                                )}
                            </span>

                            <span
                                class="status-badge status-${getStatusClass(status)}">
                                ${escapeHtml(status)}
                            </span>

                        </div>

                    </div>

                </div>

                <div class="profile-details">

                    <p>
                        <strong>País:</strong>
                        ${escapeHtml(
                            profile.country || ""
                        )}
                    </p>

                    <p>
                        <strong>Puesto:</strong>
                        ${escapeHtml(
                            profile.position || ""
                        )}
                    </p>

                    <p>
                        <strong>Ubicación:</strong>
                        ${escapeHtml(
                            profile.location || ""
                        )}
                    </p>

                    <p>
                        <strong>Experiencia:</strong>
                        ${escapeHtml(
                            String(
                                profile.experience || 0
                            )
                        )} años
                    </p>

                </div>

                <p class="profile-summary">
                    ${escapeHtml(visibleSummary)}
                </p>

                <div class="skills-container">
                    ${skillsHtml}
                </div>

                <div class="linkedin-container">

                    <a
                        href="${safeLinkedInUrl(
                            profile.linkedin
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="linkedin-btn">
                        🔗 LinkedIn
                    </a>

                </div>

            </article>
            `
        );

    });

}


// ====================================
// RENDERIZAR MI PERFIL
// ====================================

function renderMyProfile() {

    if (!myProfileContainer) {
        return;
    }

    if (!currentUser) {

        myProfileContainer.innerHTML = `
            <div class="private-profile-message">

                <h3>
                    Inicia sesión
                </h3>

                <p>
                    Necesitas iniciar sesión para consultar
                    y administrar tu perfil.
                </p>

                <button
                    type="button"
                    class="primary-action"
                    id="myProfileLoginBtn">
                    Iniciar sesión
                </button>

            </div>
        `;

        const myProfileLoginBtn =
            document.getElementById(
                "myProfileLoginBtn"
            );

        myProfileLoginBtn?.addEventListener(
            "click",
            () => loginBtn?.click()
        );

        return;

    }

    const myProfile =
        getCurrentUserProfile();

    if (!myProfile) {

        myProfileContainer.innerHTML = `
            <div class="empty-profile">

                <h3>
                    Aún no tienes un perfil
                </h3>

                <p>
                    Crea tu perfil profesional para aparecer
                    en la sección Talentos.
                </p>

                <button
                    type="button"
                    class="primary-action"
                    id="createMyProfileBtn">
                    Sumar mi perfil
                </button>

            </div>
        `;

        const createMyProfileBtn =
            document.getElementById(
                "createMyProfileBtn"
            );

        createMyProfileBtn?.addEventListener(
            "click",
            () => showPage("perfil")
        );

        return;

    }

    const status =
        myProfile.status || "Disponible";

    const skillsHtml =
        getSkillsHtml(myProfile.skills);

    myProfileContainer.innerHTML = `
        <article class="profile-card my-profile-card">

            <div class="profile-header">

                <div class="avatar">
                    ${escapeHtml(
                        String(
                            myProfile.name || "T"
                        )
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div class="profile-title-block">

                    <h3>
                        ${escapeHtml(
                            myProfile.name || ""
                        )}
                    </h3>

                    <div class="profile-badges">

                        <span class="area-badge">
                            ${escapeHtml(
                                myProfile.area || ""
                            )}
                        </span>

                        <span
                            class="status-badge status-${getStatusClass(status)}">
                            ${escapeHtml(status)}
                        </span>

                    </div>

                </div>

            </div>

            <div class="profile-details">

                <p>
                    <strong>Puesto:</strong>
                    ${escapeHtml(
                        myProfile.position || ""
                    )}
                </p>

                <p>
                    <strong>País:</strong>
                    ${escapeHtml(
                        myProfile.country || ""
                    )}
                </p>

                <p>
                    <strong>Ubicación:</strong>
                    ${escapeHtml(
                        myProfile.location || ""
                    )}
                </p>

                <p>
                    <strong>Experiencia:</strong>
                    ${escapeHtml(
                        String(
                            myProfile.experience || 0
                        )
                    )} años
                </p>

            </div>

            <p class="profile-summary">
                ${escapeHtml(
                    myProfile.summary || ""
                )}
            </p>

            <div class="skills-container">
                ${skillsHtml}
            </div>

            <div class="card-actions">

                <button
                    type="button"
                    class="edit-profile-btn"
                    id="editMyProfileBtn">
                    ✏️ Editar perfil
                </button>

                <a
                    href="${safeLinkedInUrl(
                        myProfile.linkedin
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="linkedin-btn">
                    🔗 LinkedIn
                </a>

            </div>

        </article>
    `;

    const editMyProfileBtn =
        document.getElementById(
            "editMyProfileBtn"
        );

    editMyProfileBtn?.addEventListener(
        "click",
        () => editProfile(myProfile.id)
    );

}


// ====================================
// CREAR O ACTUALIZAR PERFIL
// ====================================

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!currentUser) {

                alert(
                    "Debes iniciar sesión con Google para publicar un perfil."
                );

                return;

            }

            const existingProfile =
                getCurrentUserProfile();

            if (
                !editingProfileId &&
                existingProfile
            ) {

                alert(
                    "Ya tienes un perfil creado. Puedes modificarlo desde Mi perfil."
                );

                showPage("miPerfil");

                return;

            }

            const linkedin =
                normalizeLinkedInUrl(
                    document
                        .getElementById("linkedin")
                        .value
                );

            if (!linkedin) {

                alert(
                    "Introduce un enlace de LinkedIn válido."
                );

                return;

            }

            const profileData = {

                uid:
                    currentUser.uid,

                email:
                    currentUser.email || "",

                ownerName:
                    currentUser.displayName || "",

                name:
                    document
                        .getElementById("name")
                        .value
                        .trim(),

                status:
                    document
                        .getElementById("status")
                        .value,

                country:
                    document
                        .getElementById("country")
                        .value,

                area:
                    document
                        .getElementById("area")
                        .value,

                position:
                    document
                        .getElementById("position")
                        .value
                        .trim(),

                location:
                    document
                        .getElementById("location")
                        .value
                        .trim(),

                experience:
                    Number(
                        document
                            .getElementById("experience")
                            .value
                    ),

                linkedin:
                    linkedin,

                summary:
                    document
                        .getElementById("summary")
                        .value
                        .trim(),

                skills:
                    document
                        .getElementById("skills")
                        .value
                        .trim(),

                active:
                    true,

                updatedAt:
                    new Date()

            };

            try {

                if (editingProfileId) {

                    const profileToEdit =
                        allProfiles.find(
                            profile =>
                                profile.id ===
                                editingProfileId
                        );

                    if (
                        !profileToEdit ||
                        profileToEdit.uid !==
                            currentUser.uid
                    ) {

                        alert(
                            "No tienes permisos para editar este perfil."
                        );

                        return;

                    }

                    await updateDoc(
                        doc(
                            db,
                            "profiles",
                            editingProfileId
                        ),
                        profileData
                    );

                    alert(
                        "✅ Perfil actualizado correctamente"
                    );

                } else {

                    await addDoc(
                        collection(
                            db,
                            "profiles"
                        ),
                        {
                            ...profileData,
                            createdAt:
                                new Date()
                        }
                    );

                    alert(
                        "✅ Perfil publicado correctamente"
                    );

                }

                resetProfileForm();

                await loadProfiles();

                showPage("miPerfil");

            } catch (error) {

                console.error(
                    "Error al guardar perfil:",
                    error
                );

                alert(
                    "No se pudo guardar el perfil."
                );

            }

        }
    );

}


// ====================================
// EDITAR PERFIL
// ====================================

function editProfile(profileId) {

    const profile =
        allProfiles.find(
            item => item.id === profileId
        );

    if (!profile) {

        alert(
            "No se encontró el perfil."
        );

        return;

    }

    if (
        !currentUser ||
        profile.uid !== currentUser.uid
    ) {

        alert(
            "No tienes permisos para editar este perfil."
        );

        return;

    }

    editingProfileId =
        profile.id;

    document.getElementById("name").value =
        profile.name || "";

    document.getElementById("status").value =
        profile.status || "Disponible";

    document.getElementById("country").value =
        profile.country || "";

    document.getElementById("area").value =
        profile.area || "";

    document.getElementById("position").value =
        profile.position || "";

    document.getElementById("location").value =
        profile.location || "";

    document.getElementById("experience").value =
        profile.experience || "";

    document.getElementById("linkedin").value =
        profile.linkedin || "";

    document.getElementById("summary").value =
        profile.summary || "";

    document.getElementById("skills").value =
        profile.skills || "";

    if (profileFormTitle) {
        profileFormTitle.textContent =
            "Editar mi perfil";
    }

    if (profileSubmitBtn) {
        profileSubmitBtn.textContent =
            "Guardar cambios";
    }

    if (cancelEditBtn) {
        cancelEditBtn.hidden = false;
    }

    showPage("perfil");

}


// ====================================
// REINICIAR FORMULARIO
// ====================================

function resetProfileForm() {

    editingProfileId = null;

    if (profileForm) {
        profileForm.reset();
    }

    const statusField =
        document.getElementById("status");

    if (statusField) {
        statusField.value = "Disponible";
    }

    if (profileFormTitle) {
        profileFormTitle.textContent =
            "Sumar mi perfil";
    }

    if (profileSubmitBtn) {
        profileSubmitBtn.textContent =
            "Publicar perfil";
    }

    if (cancelEditBtn) {
        cancelEditBtn.hidden = true;
    }

}


if (cancelEditBtn) {

    cancelEditBtn.addEventListener(
        "click",
        () => {

            resetProfileForm();

            if (getCurrentUserProfile()) {
                showPage("miPerfil");
            } else {
                showPage("inicio");
            }

        }
    );

}


// ====================================
// FILTROS
// ====================================

function applyFilters() {

    const search =
        normalizeText(
            searchInput?.value
        );

    const selectedArea =
        areaFilter?.value || "all";

    const selectedCountry =
        countryFilter?.value || "all";

    const filteredProfiles =
        allProfiles.filter(profile => {

            const searchableText = [
                profile.name,
                profile.position,
                profile.skills,
                profile.location,
                profile.area,
                profile.country
            ]
                .map(normalizeText)
                .join(" ");

            const matchesSearch =
                searchableText.includes(search);

            const matchesArea =
                selectedArea === "all" ||
                profile.area === selectedArea;

            const matchesCountry =
                selectedCountry === "all" ||
                profile.country ===
                    selectedCountry;

            return (
                matchesSearch &&
                matchesArea &&
                matchesCountry
            );

        });

    renderProfiles(filteredProfiles);

}


searchInput?.addEventListener(
    "input",
    applyFilters
);

areaFilter?.addEventListener(
    "change",
    applyFilters
);

countryFilter?.addEventListener(
    "change",
    applyFilters
);


// ====================================
// MODO OSCURO
// ====================================

themeBtn?.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );

        themeBtn.textContent =
            document.body.classList.contains(
                "dark"
            )
                ? "☀️"
                : "🌙";

    }
);