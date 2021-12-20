import { Router } from "express";
import getLogin, { getLoginAuth } from "./controllers/login/getLogin";
import postLogin from "./controllers/login/postLogin";
import getLocations from "./controllers/locations/getLocations";
import register from "./controllers/team/register";
import getCourseSearch from "./controllers/course/getCourseSearch";
import newPassword from "./controllers/password/newPassword";
import postPasswordRecovery from "./controllers/password/postPasswordRecovery";
import postPreference from "./controllers/team/preferences/postPreferences";
import getConfirmEmail from "./controllers/email/getConfirmEmail";
import getConfirmEmailToken from "./controllers/email/getConfirmEmailToken";
import postInterest from "./controllers/team/interest/postInterest";
import getInterest from "./controllers/team/interest/getInterest";
import getSearch from "./controllers/team/search/getSearch";
import getSearchCount from "./controllers/team/search/getSearchCount";
import postFavourite from "./controllers/team/favourite/postFavourite";
import getFavourite from "./controllers/team/favourite/getFavourite";
import getTeamById, { getTeamByIdAuth } from "./controllers/team/getTeamById";
import getChatToken from "./controllers/team/getChatToken";
import updatePassword from "./controllers/team/updatePassword";
import patchTeam from "./controllers/team/patchTeam";
import logoff from "./controllers/team/logoff";
import getPreference, { getPreferenceAuth } from "./controllers/team/preferences/getPreferences";
import plainAuth from "./middlewares/auth/extensions/plainAuth";
import postMember from "./controllers/team/members/postMember";
import deleteMember from "./controllers/team/members/deleteMember";
import credentialsAuth from "./middlewares/auth/extensions/credentialsAuth";
import patchMember from "./controllers/team/members/patchMember";
import plainNonVerifiedAuth from "./middlewares/auth/extensions/plainNonVerifiedAuth";
import { simpleSearchAuth } from "./utils/queries/simpleSearch";
import postReport from "./controllers/report/postReport";
import postAdvisor from "./controllers/team/advisors/postAdvisor";
import deleteAdvisor from "./controllers/team/advisors/deleteAdvisor";
import patchAdvisor from "./controllers/team/advisors/patchAdvisor";
import registerModerator from "./controllers/moderator/register";
import getAllReports from "./controllers/report/getAllReports";
import plainAuthModerator from "./middlewares/auth/extensions/plainAuthModerator";
import getReportById from "./controllers/report/getReportById";
import getAllReportsCount from "./controllers/report/getAllReportsCount";
import postTakeover from "./controllers/report/postTakeover";
import postResolve from "./controllers/report/postResolve";
import banTeam from "./controllers/moderator/banTeam";
import getTeams from "./controllers/team/getTeams";
import getTeamsCount from "./controllers/team/getTeamsCount";
import requestKey from "./controllers/moderator/requestKey";
import getKeys from "./controllers/moderator/getKeys";
import patchModerator from "./controllers/moderator/patchModerator";
import patchModeratorPassword from "./controllers/moderator/patchModeratorPassword";
import createPost from "./controllers/post/createPost";
import deletePost from "./controllers/post/deletePost";
import getPosts from "./controllers/post/getPosts";
import postCourse from "./controllers/course/postCourse";
import getCourse from "./controllers/course/getCourse";
import patchCourse from "./controllers/course/patchCourse";
import deleteCourse from "./controllers/course/deleteCourse";
import postMergeCourses from "./controllers/course/postMergeCourses";
import countKeys from "./controllers/moderator/countKeys";
import countPosts from "./controllers/post/countPosts";
import getCourseCount from "./controllers/course/getCourseCount";
import getKeywordSearch from "./controllers/keyword/getKeywordSearch";

const router = Router();

router.get("/report", plainAuthModerator, getAllReports);
router.get("/report/count", plainAuthModerator, getAllReportsCount);
router.post("/moderator", registerModerator);
router.get("/team", plainAuthModerator, getTeams);
router.get("/team/count", plainAuthModerator, getTeamsCount);
router.get("/report/:id", plainAuthModerator, getReportById);
router.post("/report/:id/takeover", plainAuthModerator, postTakeover);
router.post("/report/:id/resolve", plainAuthModerator, postResolve);
router.delete("/team/:id/ban", plainAuthModerator, banTeam);
router.get("/moderator/key", plainAuthModerator, requestKey);
router.get("/moderator/keys", plainAuthModerator, getKeys);
router.get("/moderator/countKeys", plainAuthModerator, countKeys);
router.patch("/moderator", plainAuthModerator, patchModerator);
router.patch("/moderator/password", plainAuthModerator, patchModeratorPassword);
router.post("/post", plainAuthModerator, createPost);
router.delete("/post/:id", plainAuthModerator, deletePost);
router.post("/course", plainAuthModerator, postCourse);
router.get("/course", plainAuthModerator, getCourse);
router.patch("/course/:id", plainAuthModerator, patchCourse);
router.delete("/course/:id", plainAuthModerator, deleteCourse);
router.get("/course/count", plainAuthModerator, getCourseCount);
router.post("/course/merge", plainAuthModerator, postMergeCourses);

router.get("/logoff", logoff);
router.get("/post/count", countPosts);
router.get("/post", getPosts);
router.post("/team", register);
router.post("/login", postLogin);
router.get("/login", getLoginAuth, getLogin);
router.get("/locations", getLocations);
router.post("/team/password-recovery", postPasswordRecovery);
router.get("/team/confirm-email", plainNonVerifiedAuth, getConfirmEmail);
router.post("/team/preferences", plainNonVerifiedAuth, postPreference);
router.get("/team/preferences", getPreferenceAuth, getPreference);
router.get("/team/interest", plainAuth, getInterest);
router.get("/team/search", simpleSearchAuth, getSearch);
router.get("/team/search/count", simpleSearchAuth, getSearchCount);
router.get("/team/favourite", plainAuth, getFavourite);
router.get("/team/chat-token", plainAuth, getChatToken);
router.post("/team/update-password", credentialsAuth, updatePassword); 
router.patch("/team", credentialsAuth, patchTeam);
router.post("/team/members", credentialsAuth, postMember);
router.post("/report", plainAuth, postReport)
router.post("/team/advisors", credentialsAuth, postAdvisor);
router.get("/course/search/:name", getCourseSearch);
router.post("/team/password-recovery/new-password/:token", newPassword);
router.get("/team/confirm-email/:token", getConfirmEmailToken);
router.post("/team/:id/interest", plainAuth, postInterest);
router.post("/team/:id/favourite", plainAuth, postFavourite);
router.get("/team/:id", getTeamByIdAuth, getTeamById);
router.delete("/team/members/:id", credentialsAuth, deleteMember);
router.patch("/team/members/:id", credentialsAuth, patchMember);
router.delete("/team/advisors/:id", credentialsAuth, deleteAdvisor);
router.patch("/team/advisors/:id", credentialsAuth, patchAdvisor);
router.get("/keyword/search/:name", getKeywordSearch);

export default router;
