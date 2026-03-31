/**
 * Brownielicious Authentication JavaScript
 * 
 * This file handles all authentication-related functionality including:
 * - Login/Signup form toggling
 * - Form validation
 * - Supabase authentication (database)
 * - Session management
 */

// ============================================
// Tab Switching Functionality
// ============================================

function switchTab(tab) {
  const loginTab = document.getElementById("login-tab");
  const signupTab = document.getElementById("signup-tab");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const slider = document.getElementById("auth-slider");
  const toggleText = document.getElementById("toggle-text");

  if (tab === "login") {
    loginTab.classList.remove("inactive");
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    signupTab.classList.add("inactive");
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
    slider.style.left = "0%";
    toggleText.innerHTML = `Don't have an account? <a href="#" onclick="switchTab('signup'); return false;" class="text-caramel hover:text-cocoa font-semibold">Sign Up</a>`;
  } else {
    signupTab.classList.remove("inactive");
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    loginTab.classList.add("inactive");
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
    slider.style.left = "50%";
    toggleText.innerHTML = `Already have an account? <a href="#" onclick="switchTab('login'); return false;" class="text-caramel hover:text-cocoa font-semibold">Login</a>`;
  }
}

function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  if (field.type === "password") {
    field.type = "text";
  } else {
    field.type = "password";
  }
}

function checkPasswordStrength(password) {
  const strengthIndicator = document.querySelector(".password-strength");
  const hint = document.getElementById("password-hint");
  
  if (!password) {
    strengthIndicator.className = "password-strength bg-gray-200 rounded";
    hint.textContent = "Use 8+ characters with letters and numbers";
    return;
  }
  
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (strength <= 2) {
    strengthIndicator.className = "password-strength weak";
    hint.textContent = "Weak - try adding numbers and special characters";
  } else if (strength <= 3) {
    strengthIndicator.className = "password-strength medium";
    hint.textContent = "Medium - add more variety";
  } else {
    strengthIndicator.className = "password-strength strong";
    hint.textContent = "Strong password!";
  }
}

function showAlert(containerId, message, type = "error") {
  const container = document.getElementById(containerId);
  container.className = `alert ${type === "error" ? "alert-error" : type === "success" ? "alert-success" : "alert-warning"}`;
  container.innerHTML = message;
  container.classList.remove("hidden");
  setTimeout(() => { container.classList.add("hidden"); }, 5000);
}

function hideAlert(containerId) {
  document.getElementById(containerId).classList.add("hidden");
}

function setLoading(formType, isLoading) {
  const btn = document.getElementById(`${formType}-btn`);
  const spinner = document.getElementById(`${formType}-spinner`);
  const btnText = btn.querySelector("span");
  
  if (isLoading) {
    btn.disabled = true;
    spinner.classList.remove("hidden");
    btnText.textContent = formType === "login" ? "Logging in..." : "Creating account...";
  } else {
    btn.disabled = false;
    spinner.classList.add("hidden");
    btnText.textContent = formType === "login" ? "Login" : "Create Account";
  }
}

async function checkEmailExists(email) {
  const supabase = window.supabaseClient;
  if (!supabase) return false;
  
  try {
    const { data, error } = await supabase.from('users').select('email').eq('email', email.toLowerCase()).limit(1);
    if (error) { console.error('Error checking email:', error); return false; }
    return data && data.length > 0;
  } catch (err) { console.error('Exception checking email:', err); return false; }
}

async function signUpUser(name, email, password) {
  const supabase = window.supabaseClient;
  console.log("signUpUser called with:", { name, email });
  
  if (!supabase) {
    console.error("Supabase not initialized");
    return { success: false, message: "System not ready. Please refresh the page." };
  }
  
  try {
    console.log("Creating auth user...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: { data: { name: name } }
    });
    
    console.log("Auth response:", { authData, authError });
    
    if (authError) {
      console.error('Auth signup error:', authError);
      return { success: false, message: authError.message };
    }
    
    if (authData.user) {
      console.log("Auth user created, ID:", authData.user.id);
      // Profile is now created automatically via database trigger
      return { success: true, user: authData.user };
    }
    
    console.log("No user data returned from auth");
    return { success: false, message: "Registration failed. Please try again." };
  } catch (err) {
    console.error('Signup exception:', err);
    return { success: false, message: "An error occurred during signup: " + err.message };
  }
}

async function signInUser(email, password) {
  const supabase = window.supabaseClient;
  console.log("signInUser called with:", { email });
  
  if (!supabase) {
    console.error("Supabase not initialized");
    return { success: false, message: "System not ready. Please refresh the page." };
  }
  
  try {
    console.log("Calling supabase.auth.signInWithPassword...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });
    
    console.log("Sign in response:", { data, error });
    
    if (error) {
      console.error('Sign in error:', error);
      return { success: false, message: error.message };
    }
    
    if (data.user) {
      console.log("User signed in, ID:", data.user.id);
      console.log("Fetching user profile from users table...");
      const { data: profileData, error: profileError } = await supabase.from('users').select('*').eq('id', data.user.id).single();
      console.log("Profile data:", { profileData, profileError });
      
      const user = profileData || { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || 'User' };
      return { success: true, user };
    }
    
    return { success: false, message: "Login failed. Please try again." };
  } catch (err) {
    console.error('Sign in exception:', err);
    return { success: false, message: "An error occurred during login: " + err.message };
  }
}

async function signOutUser() {
  const supabase = window.supabaseClient;
  if (!supabase) return;
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error);
    localStorage.removeItem("brownielicious_user");
  } catch (err) { console.error('Sign out exception:', err); }
}

function getCurrentUser() {
  const userStr = localStorage.getItem("brownielicious_user");
  return userStr ? JSON.parse(userStr) : null;
}

function logout() {
  signOutUser().then(() => { window.location.href = "index.html"; });
}

function isLoggedIn() {
  return !!getCurrentUser();
}

if (window.supabaseClient) {
  window.supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) console.log('User signed in:', session.user);
    else if (event === 'SIGNED_OUT') console.log('User signed out');
  });
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const rememberMe = document.getElementById("remember-me").checked;
  hideAlert("login-alert");
  
  if (!email || !password) { showAlert("login-alert", "Please fill in all fields"); return; }
  
  setLoading("login", true);
  try {
    const result = await signInUser(email, password);
    if (result.success) {
      if (rememberMe) localStorage.setItem("brownielicious_remember", "true");
      localStorage.setItem("brownielicious_user", JSON.stringify(result.user));
      showAlert("login-alert", `Welcome back, ${result.user.name}! Redirecting...`, "success");
      setTimeout(() => { 
        const redirect = localStorage.getItem("post_login_redirect");
        localStorage.removeItem("post_login_redirect");
        window.location.href = redirect || "index.html"; 
      }, 1500);
    } else {
      showAlert("login-alert", result.message || "Invalid email or password");
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert("login-alert", "An error occurred. Please try again later.");
  } finally { setLoading("login", false); }
});

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm").value;
  const agreeTerms = document.getElementById("agree-terms").checked;
  hideAlert("signup-alert");
  
  if (!name || !email || !password || !confirmPassword) { showAlert("signup-alert", "Please fill in all fields"); return; }
  if (password !== confirmPassword) { showAlert("signup-alert", "Passwords do not match"); return; }
  if (password.length < 8) { showAlert("signup-alert", "Password must be at least 8 characters"); return; }
  if (!agreeTerms) { showAlert("signup-alert", "Please agree to the Terms of Service and Privacy Policy"); return; }
  
  setLoading("signup", true);
  console.log("Starting signup process...");
  try {
    console.log("Calling supabase.auth.signUp...");
    const result = await signUpUser(name, email, password);
    console.log("Signup result:", result);
    
    if (result.success) {
      showAlert("signup-alert", `Welcome to Brownielicious, ${name}! Please check your email to verify your account.`, "success");
      setTimeout(() => { switchTab('login'); }, 3000);
    } else {
      showAlert("signup-alert", result.message || "Registration failed. Please try again.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    showAlert("signup-alert", "An error occurred. Please try again later.");
  } finally { setLoading("signup", false); }
});

document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profileData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      if (profileData) {
        localStorage.setItem("brownielicious_user", JSON.stringify(profileData));
        console.log(`Welcome back, ${profileData.name}!`);
      }
    }
  }
  
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => { mobileMenu.classList.toggle("hidden"); });
  }
});

async function updateUserProfile(userId, updates) {
  const supabase = window.supabaseClient;
  if (!supabase) return { success: false, message: "System not ready" };
  
  try {
    const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select().single();
    if (error) return { success: false, message: error.message };
    if (data) localStorage.setItem("brownielicious_user", JSON.stringify(data));
    return { success: true, user: data };
  } catch (err) { return { success: false, message: "Failed to update profile" }; }
}

async function changePassword(newPassword) {
  const supabase = window.supabaseClient;
  if (!supabase) return { success: false, message: "System not ready" };
  
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Password updated successfully" };
  } catch (err) { return { success: false, message: "Failed to change password" }; }
}

async function requestPasswordReset(email) {
  const supabase = window.supabaseClient;
  if (!supabase) return { success: false, message: "System not ready" };
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth.html?reset=true' });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Password reset email sent" };
  } catch (err) { return { success: false, message: "Failed to send reset email" }; }
}
