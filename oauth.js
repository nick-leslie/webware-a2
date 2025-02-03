// https://accounts.google.com/o/oauth2/auth?client_id={clientid}&redirect_uri={redirectURI}&scope={scope}&response_type=code
// https://www.googleapis.com/auth/userinfo.email
//
//	https://www.googleapis.com/auth/userinfo.profile
//	openid

// https://oauth2.googleapis.com/tokeninfo?id_token=XYZ123 verify token

function GoogleConsent(response) {
  const scopes = ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile", "openid"].join(" ")
  const clientId = process.env.GOOGLE_CLIENT_ID;
	const redirectUrl = process.env.REDIRECT_URL
	const formatedUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&access_type=offline&&redirect_uri=${redirectUrl}&scope=${scopes}&response_type=code`;
	console.log(formatedUrl)
 res.writeHead(302, {
      'Location': formatedUrl
    });
 res.end();
}

async function GetGoogleToken(authCode) {
	const googleTokenRequest = {
		AccessCode:   code,
		ClientSecret: process.env.GOOGLE_CLIENT_SECRET,
		ClientId:     process.env.GOOGLE_CLIENT_ID,
		RedirectUri:  process.env.REDIRECT_URL,
		GrantType:    "authorization_code",
	}

  try {
    //tood fill this out
    const res = await fetch("https://oauth2.googleapis.com/token",{
      method:"POST",
      body: JSON.Encode(googleTokenRequest)
    })
    const resJson = res.json();
    return resJson;
  } catch {
    throw new error("failed to generate token")
  }
}

async function GetGoogleUserInfo(token) {
	const res = await fetch("GET", "https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
	 method:"GET",
	 headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.AccessToken}`
		},
	})
	return await res.json()
}

//typescipt types
// type GoogleTokenRequest = {
//   AccessCode:   string
// 	ClientId:     string
// 	ClientSecret: string
// 	RedirectUri:  string
// 	GrantType:    string
// }

// type GoogleToken = {
//   AccessToken : string
//   ExpiresIn   : int
//   RefreshToken: string
//   Scope       : string
//   TokenType   : string
// }

// type SpaceonaUserToken  {
// 	UserInfo:    GoogleUserInfo
// 	GoogleToken: GoogleToken
// 	tokenString: string
// }

// function AuthenticateSpaceonaUser(request)  {
// 	query := r.URL.Query()
// 	code := query.Get("code")

// 	googleToken, tokenErr := GetGoogleToken(code)
// 	if tokenErr != nil {
// 		return nil, tokenErr
// 	}
// 	userInfo, userInfoErr := GetGoogleUserInfo(googleToken)
// 	if userInfoErr != nil {
// 		return nil, userInfoErr
// 	}
// 	//TODO check if the user is an admin

// 	slog.Info(spaceonaToken)
// 	if spaceonaTokenError != nil {
// 		return nil, spaceonaTokenError
// 	}
// 	return token, nil
// }

// func WriteSpaceonaTokenToCooke(w http.ResponseWriter, r *http.Request, token *SpaceonaUserToken) {
// 	buf := new(bytes.Buffer)
// 	tokenErr := json.NewEncoder(buf).Encode(*token)
// 	if tokenErr != nil {
// 		return
// 	}
// 	cookie := http.Cookie{
// 		Name:     "AuthToken",
// 		Value:    token.tokenString,
// 		Domain:   "localhost",
// 		Path:     "/",
// 		Expires:  time.Now().Add(time.Duration(token.GoogleToken.ExpiresIn) * time.Second),
// 		MaxAge:   token.GoogleToken.ExpiresIn,
// 		Secure:   true,
// 		HttpOnly: true,
// 		SameSite: http.SameSiteLaxMode,
// 	}
// 	http.SetCookie(w, &cookie)
// }

// func Redirect(w http.ResponseWriter, r *http.Request, token *SpaceonaUserToken) {
// 	http.Redirect(w, r, "https://spaceona.com", http.StatusPermanentRedirect)
// }

// func AuthWithRefreshToken(w http.ResponseWriter, r *http.Request) {

// }



// type GoogleUserInfo struct {
// 	Id            string `json:"id"`
// 	Email         string `json:"email"`
// 	VerifiedEmail bool   `json:"verified_email"`
// 	Name          string `json:"name"`
// 	GivenName     string `json:"given_name"`
// 	FamilyName    string `json:"family_name"`
// 	Picture       string `json:"picture"`
// }
