const schema = {
    User: {
        Name: String, Id: String,
    },

    Room: {
        Id: String, Players: 'UserIds[]', Games: 'game[]', activeQuestioner: 'UserId[]'
    },

    Game: {
        question: "gameCard", answers: "gameCard[]"
    },

    gameCard: {
        player: 'UserId', card: 'card', isActive: Boolean,
    },

    card: {
        isQuestion: Boolean, text: String,
    }
}
