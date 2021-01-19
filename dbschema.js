let db = {
    users: [
      {
        userId: 'dh23ggj5h32g543j5gf43',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2019-03-15T10:59:52.798Z',
        imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
        bio: 'Hello, my name is user, nice to meet you',
        website: 'https://user.com',
        location: 'London, UK'
      }
    ],
    notes: [
      {
        userHandle: 'user',
        body: 'This is a sample note',
        createdAt: '2019-03-15T10:59:52.798Z',
        shieldCount: 5,
        commentCount: 3,
        location:'pune, mh'
      }
    ],
    comments: [
      {
        userHandle: 'user',
        noteId: 'kdjsfgdksuufhgkdsufky',
        body: 'nice one mate!',
        createdAt: '2019-03-15T10:59:52.798Z'
      }
    ],
    notifications: [
      {
        recipient: 'user',
        sender: 'john',
        read: 'true | false',
        noteId: 'kdjsfgdksuufhgkdsufky',
        type: 'shield | comment',
        createdAt: '2019-03-15T10:59:52.798Z'
      }
    ]
  };
  const userDetails = {
    // Redux data
    credentials: {
      userId: 'N43KJ5H43KJHREW4J5H3JWMERHB',
      email: 'user@email.com',
      handle: 'user',
      createdAt: '2019-03-15T10:59:52.798Z',
      imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
      bio: 'Hello, my name is user, nice to meet you',
      website: 'https://user.com',
      location: 'Lonodn, UK'
    },
    shields: [
      {
        userHandle: 'user',
        noteId: 'hh7O5oWfWucVzGbHH2pa'
      },
      {
        userHandle: 'user',
        noteId: '3IOnFoQexRcofs5OhBXO'
      }
    ]
  };
  