var config = {
    login : {
        //Use to find your worksheet (On your Jira -> Tempo -> Tempo settings)
        token: 'XXXXXXXXXX-us',
        //Click on profile icon on the sidebar -> "Profile" link. In the URL you can find your accountId after the last "/" :
        accountId: 'AAAAAAAAAAA',
    },
    info : {
        firstname: 'John',
        lastname: 'Does',
        company: 'Spektrum SA',
        profession: 'Computer Scientist',
        stageInfo: '4th year long internship from August 1, 2023 to July 31, 2024',
        companyResponsible: 'John 2',
        schoolResponsible: 'John 3',
        year: 4
    },
    recurringTasks : [
        //Example :
        /*{
            day: 1, // Monday
            title: '',
            description: '',
            duration: '1h00'
        },{
            day: 2, // Tuesday
            title: '',
            description: '',
            duration: '7h00'
        }*/
    ]
}
module.exports = config;