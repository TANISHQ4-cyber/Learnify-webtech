/*
  LEARNIFY WEBTECH

  Supabase setup:
  1. Create a Supabase project.
  2. Get Project URL.
  3. Get Publishable Key.
  4. Put them below.

  NEVER put a Supabase Secret/Service Role key here.
*/


/* =========================================
   SUPABASE CONFIG
========================================= */

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";


/* =========================================
   SUPABASE CLIENT
========================================= */

let supabaseClient = null;

if (
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("YOUR_") &&
  !SUPABASE_PUBLISHABLE_KEY.includes("YOUR_")
) {
  const script = document.createElement("script");

  script.src =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

  script.onload = () => {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    startSupabase();
  };

  script.onerror = () => {
    hideLoading();
    showAuth();
    showToast("Supabase library could not load.");
  };

  document.head.appendChild(script);

} else {

  /*
    Supabase is not configured yet.

    The app still opens so you can preview
    the design.
  */

  setTimeout(() => {

    hideLoading();

    showAuth();

  }, 600);
}


/* =========================================
   DEMO PREVIEW LESSONS
=========================================

   These are ONLY local UI placeholders so
   the website design can be viewed before
   Supabase is connected.

   They are not fake database users/data.
*/

const previewLessons = [
  {
    id: "preview-1",
    title: "Introduction to Web Development",
    category: "Webtech",
    description:
      "Learn the basic concepts of HTML, CSS and JavaScript.",
    video_url: ""
  },

  {
    id: "preview-2",
    title: "LED Repair Basics",
    category: "LED Repair",
    description:
      "Understand the basic parts and working of LED displays.",
    video_url: ""
  },

  {
    id: "preview-3",
    title: "Electronics Fundamentals",
    category: "Electronics",
    description:
      "Start learning the basic concepts of electronics.",
    video_url: ""
  }
];


/* =========================================
   STATE
========================================= */

let lessons = [];
let selectedCategory = "All";
let searchTerm = "";
let isSignup = false;
let currentUser = null;


/* =========================================
   DOM
========================================= */

const loadingScreen =
  document.getElementById("loadingScreen");

const authScreen =
  document.getElementById("authScreen");

const app =
  document.getElementById("app");

const authForm =
  document.getElementById("authForm");

const authTitle =
  document.getElementById("authTitle");

const authSubtitle =
  document.getElementById("authSubtitle");

const authButton =
  document.getElementById("authButton");

const nameField =
  document.getElementById("nameField");

const nameInput =
  document.getElementById("nameInput");

const emailInput =
  document.getElementById("emailInput");

const passwordInput =
  document.getElementById("passwordInput");

const authMessage =
  document.getElementById("authMessage");

const switchAuth =
  document.getElementById("switchAuth");

const latestLessons =
  document.getElementById("latestLessons");

const courseLessons =
  document.getElementById("courseLessons");

const searchInput =
  document.getElementById("searchInput");

const toast =
  document.getElementById("toast");

const videoModal =
  document.getElementById("videoModal");

const lessonVideo =
  document.getElementById("lessonVideo");

const videoTitle =
  document.getElementById("videoTitle");

const videoCategory =
  document.getElementById("videoCategory");

const videoDescription =
  document.getElementById("videoDescription");


/* =========================================
   INITIALIZE
========================================= */

function hideLoading() {
  loadingScreen.classList.add("hidden");
}

function showAuth() {
  authScreen.classList.remove("hidden");
  app.classList.add("hidden");
}

function showApp() {
  authScreen.classList.add("hidden");
  app.classList.remove("hidden");
}


/* =========================================
   SUPABASE START
========================================= */

async function startSupabase() {

  hideLoading();

  try {

    const {
      data: {
        session
      }
    } = await supabaseClient.auth.getSession();

    if (session) {

      currentUser = session.user;

      showApp();

      await loadProfile();
      await loadLessons();

    } else {

      showAuth();

    }

    supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {

        if (session) {

          currentUser = session.user;

          showApp();

          await loadProfile();
          await loadLessons();

        } else {

          currentUser = null;

          showAuth();

        }

      }
    );

  } catch (error) {

    console.error(error);

    showAuth();

    showToast("Unable to connect to Supabase.");

  }
}


/* =========================================
   AUTH MODE
========================================= */

switchAuth.addEventListener(
  "click",
  () => {

    isSignup = !isSignup;

    clearAuthMessage();

    if (isSignup) {

      authTitle.textContent =
        "Create Account";

      authSubtitle.textContent =
        "Create your Learnify account.";

      authButton.textContent =
        "Sign Up";

      nameField.classList.remove("hidden");

      switchAuth.innerHTML =
        "Already have an account? <b>Sign In</b>";

    } else {

      authTitle.textContent =
        "Welcome Back";

      authSubtitle.textContent =
        "Sign in to continue learning.";

      authButton.textContent =
        "Sign In";

      nameField.classList.add("hidden");

      switchAuth.innerHTML =
        "Don't have an account? <b>Sign Up</b>";

    }

  }
);


/* =========================================
   AUTH SUBMIT
========================================= */

authForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;

    const name =
      nameInput.value.trim();


    if (!email || !password) {

      setAuthMessage(
        "Please enter your email and password.",
        true
      );

      return;

    }


    if (!supabaseClient) {

      setAuthMessage(
        "Supabase is not connected yet. Add your Supabase URL and Publishable Key in script.js.",
        true
      );

      return;

    }


    authButton.disabled = true;

    authButton.textContent =
      isSignup ? "Creating..." : "Signing in...";


    try {

      if (isSignup) {

        if (!name) {

          setAuthMessage(
            "Please enter your name.",
            true
          );

          authButton.disabled = false;
          authButton.textContent = "Sign Up";

          return;
        }


        const {
          data,
          error
        } =
          await supabaseClient.auth.signUp({

            email,
            password,

            options: {
              data: {
                full_name: name
              }
            }

          });


        if (error) {
          throw error;
        }


        if (data.session) {

          setAuthMessage(
            "Account created successfully."
          );

        } else {

          setAuthMessage(
            "Account created. Please confirm your email before signing in."
          );

        }


        authForm.reset();

      } else {

        const {
          error
        } =
          await supabaseClient.auth.signInWithPassword({

            email,
            password

          });


        if (error) {
          throw error;
        }

      }

    } catch (error) {

      console.error(error);

      setAuthMessage(
        error.message || "Authentication failed.",
        true
      );

    } finally {

      authButton.disabled = false;

      authButton.textContent =
        isSignup ? "Sign Up" : "Sign In";

    }

  }
);


/* =========================================
   PROFILE
========================================= */

async function loadProfile() {

  if (!supabaseClient || !currentUser) {
    return;
  }


  let profile = null;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();


    if (error) {
      console.error(error);
    }

    profile = data;

  } catch (error) {

    console.error(error);

  }


  const metadata =
    currentUser.user_metadata || {};


  const name =
    profile?.full_name ||
    metadata.full_name ||
    currentUser.email?.split("@")[0] ||
    "User";


  const role =
    profile?.role ||
    "student";


  setText(
    "profileName",
    name
  );

  setText(
    "profileEmail",
    currentUser.email || ""
  );

  setText(
    "profileRole",
    capitalize(role)
  );


  const initial =
    name.charAt(0).toUpperCase();


  setText(
    "profileAvatar",
    initial
  );

  setText(
    "miniInitial",
    initial
  );
}


/* =========================================
   LOAD LESSONS
========================================= */

async function loadLessons() {

  if (!supabaseClient) {

    lessons = previewLessons;

    renderLessons();

    return;
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("lessons")
        .select("*")
        .order("created_at", {
          ascending: false
        });


    if (error) {
      throw error;
    }


    lessons = data || [];

    renderLessons();


  } catch (error) {

    console.error(error);

    lessons = [];

    renderLessons();

    showToast(
      "Could not load lessons from database."
    );

  }

}


/* =========================================
   FILTER LESSONS
========================================= */

function getFilteredLessons() {

  return lessons.filter(
    lesson => {

      const categoryMatch =
        selectedCategory === "All" ||
        lesson.category === selectedCategory;


      const text =
        `${lesson.title || ""} ${
          lesson.description || ""
        } ${lesson.category || ""}`
          .toLowerCase();


      const searchMatch =
        !searchTerm ||
        text.includes(
          searchTerm.toLowerCase()
        );


      return categoryMatch && searchMatch;

    }
  );

}


/* =========================================
   RENDER
========================================= */

function renderLessons() {

  const filtered =
    getFilteredLessons();


  if (!filtered.length) {

    courseLessons.innerHTML =
      emptyLessons();

    latestLessons.innerHTML =
      emptyLessons();

    return;

  }


  latestLessons.innerHTML =
    filtered
      .slice(0, 3)
      .map(createLessonCard)
      .join("");


  courseLessons.innerHTML =
    filtered
      .map(createLessonCard)
      .join("");

}


function createLessonCard(lesson) {

  const safeTitle =
    escapeHTML(
      lesson.title || "Untitled Lesson"
    );

  const safeCategory =
    escapeHTML(
      lesson.category || "Lesson"
    );

  const safeDescription =
    escapeHTML(
      lesson.description ||
      "Start learning this lesson."
    );


  return `
    <article class="lesson-card">

      <div class="lesson-thumbnail">

        <div class="play-circle">
          ▶
        </div>

      </div>

      <div class="lesson-body">

        <div class="lesson-category">
          ${safeCategory}
        </div>

        <h3 class="lesson-title">
          ${safeTitle}
        </h3>

        <p class="lesson-description">
          ${safeDescription}
        </p>

        <button
          class="lesson-btn"
          onclick="openLesson('${escapeAttribute(lesson.id)}')"
        >
          Watch Lesson
        </button>

      </div>

    </article>
  `;

}


function emptyLessons() {

  return `
    <div class="empty-state">
      <h3>No lessons found</h3>
      <p>
        Lessons will appear here when they are
        added to the database.
      </p>
    </div>
  `;

}


/* =========================================
   NAVIGATION
========================================= */

function showPage(pageId) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });


  const page =
    document.getElementById(pageId);


  if (page) {

    page.classList.add("active");

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page === pageId
      );

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


document
  .querySelectorAll(".nav-item")
  .forEach(item => {

    item.addEventListener(
      "click",
      () => {

        showPage(
          item.dataset.page
        );

      }
    );

  });


document
  .getElementById("profileMini")
  .addEventListener(
    "click",
    () => {

      showPage("profilePage");

    }
  );


/* =========================================
   CATEGORY
========================================= */

document
  .querySelectorAll(".category")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".category")
          .forEach(item => {

            item.classList.remove(
              "active"
            );

          });


        button.classList.add("active");


        selectedCategory =
          button.dataset.category;


        renderLessons();

      }
    );

  });


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
  "input",
  event => {

    searchTerm =
      event.target.value.trim();

    renderLessons();

  }
);


/* =========================================
   VIDEO
========================================= */

function openLesson(id) {

  const lesson =
    lessons.find(
      item => String(item.id) === String(id)
    );


  if (!lesson) {

    showToast("Lesson not found.");

    return;

  }


  videoTitle.textContent =
    lesson.title || "Lesson";

  videoCategory.textContent =
    lesson.category || "Lesson";

  videoDescription.textContent =
    lesson.description || "";


  if (lesson.video_url) {

    lessonVideo.src =
      lesson.video_url;

    lessonVideo.classList.remove("hidden");

    videoModal.classList.remove("hidden");

  } else {

    lessonVideo.removeAttribute("src");

    lessonVideo.load();

    videoModal.classList.remove("hidden");

    showToast(
      "Video URL has not been added for this lesson yet."
    );

  }

}


function closeVideo() {

  lessonVideo.pause();

  lessonVideo.removeAttribute("src");

  lessonVideo.load();

  videoModal.classList.add("hidden");

}


document
  .getElementById("closeVideo")
  .addEventListener(
    "click",
    closeVideo
  );


document
  .getElementById("closeModal")
  .addEventListener(
    "click",
    closeVideo
  );


/* =========================================
   LOGOUT
========================================= */

document
  .getElementById("logoutButton")
  .addEventListener(
    "click",
    async () => {

      if (!supabaseClient) {

        showAuth();

        return;

      }


      try {

        const {
          error
        } =
          await supabaseClient.auth.signOut();


        if (error) {
          throw error;
        }


        showToast(
          "Logged out successfully."
        );

      } catch (error) {

        console.error(error);

        showToast(
          "Could not log out."
        );

      }

    }
  );


/* =========================================
   HELPERS
========================================= */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (element) {

    element.textContent =
      value;

  }

}


function setAuthMessage(
  message,
  error = false
) {

  authMessage.textContent =
    message;

  authMessage.style.color =
    error
      ? "#f87171"
      : "#a7f3d0";

}


function clearAuthMessage() {

  authMessage.textContent =
    "";

}


function showToast(message) {

  toast.textContent =
    message;

  toast.classList.add("show");


  clearTimeout(
    window.toastTimer
  );


  window.toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


function capitalize(value) {

  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase()
    + value.slice(1);

}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'");

}


/* =========================================
   INITIAL LOCAL PREVIEW
========================================= */

if (!supabaseClient) {

  lessons = previewLessons;

  setTimeout(
    () => {

      renderLessons();

    },
    700
  );

}
