const userRouterEndPoints = {
    userRegister : '/api/user/register',
    userLogin : '/api/user/login',
    userLogout : '/api/user/logout',
    userProfile : '/api/user/profile',
    userSearch : '/api/user/users/search',
    userAll:'/api/user/users/all',
    userVerifyOTP: '/api/user/verifyOtp',
    userResendOTP: '/api/user/resendOtp',

    // Story endpoints — all under /api/user/ to match your Express router
    getAllStories: '/api/user/stories',
    getStoryById: (storyId: string) => `/api/user/stories/${storyId}`,
    scrapeStories: '/api/user/scrape',
    toggleBookmark: (storyId: string) => `/api/user/stories/${storyId}/bookmark`,
    getBookmarks: '/api/user/bookmarks',
}

export default userRouterEndPoints