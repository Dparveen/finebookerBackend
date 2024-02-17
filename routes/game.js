const router = require('express').Router();
const User = require('../models/User');
const createHash = require('hash-generator');
const Wallet = require('../models/Wallet');
const UserType = require('../models/UserType');
const Sports = require('../models/Sports');
const Match = require('../models/Match');
const Market = require('../models/Market');
const Odds = require('../models/Odds');
const Session = require('../models/Session');
const BM = require('../models/BookMaker');
const Competition = require('../models/Competition');
const BetOdds = require('../models/BetOdds');
const BetFancy = require('../models/BetFancy');
const BetBM = require('../models/BetBookmaker');
const axios = require('axios');

const oneSecondAgo = new Date(Date.now() - 1000);


const findSports = async (sts) => { return await Sports.find({ status: sts }) };
const findAllSports = async () => { return await Sports.find() };
const findSportsByID = async (id) => { return await Sports.find({ eventType: id }) }

const findAllEvents = async () => { return await Match.find() };

const findByParentID = async (pid) => { return await User.find({ parentid: pid }) };
const findUser = async (token) => { return await User.find(token) };
// const findUserByHash = async (hash) => { return (await User.find({ hash_new: hash })) };
const findUsername = async (username) => { return await User.find({ username: username }) };
const findTransaction = async (user) => { return await Wallet.find({ $or: [{ toUser: user }, { fromUser: user }] }) };

const updateUserWalletExposer = async (username, balance, expo) => { return await User.findOneAndUpdate({ username: username }, { balance: balance, exposerAmount: expo }, { new: true }) };
const updateUser = async (username, balance) => { return await User.findOneAndUpdate({ username: username }, { balance: balance }, { new: true }) };
const updateSports = async (id, status) => { return await Sports.findOneAndUpdate({ eventType: id }, { status: status }, { new: true }) };

const findCompSportsByID = async (id, sts) => { return await Competition.find({ EventTypeID: id, status: sts }) };
const updateCompetition = async (id, status) => { return await Competition.findOneAndUpdate({ competitionID: id }, { status: status }, { new: true }) };
const findCompetition = async (id) => { return await Competition.find({ EventTypeID: id }) };
const findCompetitionByComp = async (id, eId) => { return await Competition.find({ CompetitionID: id, EventTypeID: eId, }) };

const MatchByETypeId = async (id) => { return await Match.find({ EventTypeID: id }) };
const MatchById = async (id) => { return await Match.find({ CompetitionID: id }) };
const MatchByEId = async (id) => { return await Match.find({ eventId: id }) };
const MatchByCIdSId = async (id, sid, sts) => { return await Match.find({ CompetitionID: id, EventTypeID: sid, status: sts }) };
const MatchUpdate = async (id, status) => { return await Match.findOneAndUpdate({ eventId: id }, { status: status }, { new: true }) };

const findMarketByCID = async (cId) => { return await Market.find({ ComponentId: cId }) };
const findMarketByMid = async (mId) => { return await Market.find({ marketId: mId }) };
const findMarket = async (eventId) => { return await Market.find({ EventID: eventId }) };
const findMarketByGameId = async (gameId) => { return await Market.find({ GameId: gameId }) };
const findAllMarket = async (eventId) => { return await Market.find() };
const updateMarket = async (id, status) => { return await Market.findOneAndUpdate({ EventID: id }, { status: status }, { new: true }) };

const findSession = async (eventId) => { return await Session.find({ matchId: eventId }) };
const findBMByMatch = async (mrkt) => { return await BM.find({ ComponentId: mrkt }) };

// const findOddsByMarketByAll = async (eventId, sec) => { return await Odds.find({market_id:eventId, "runners.selectionId":sec}) };
// const findBMByMarketByAll = async (eventId, sec) => { return await BM.find({nat:eventId, marketId:sec}) };
// const findFancyByMarketByAll = async (eventId, sec) => { return await Fancy.find({matchId:eventId, "session.SelectionId":sec}) };

const findOddsByMarket = async (eventId) => { return await Odds.find({ market_id: eventId }) };
const findOddsByGameID = async (gId, sts) => { return await Odds.find({ gameId: gId, status:sts }) };

const updateFancy =async(e,u,v)=>{return await Session.updateOne({ matchId: e, "session.SelectionId": u },{ $set: { "session.$.GameStatus": v } })};
const updateFancyStatus = async (e, u, v) => {
  try {
    const result = await Session.updateOne(
      { matchId: e, "session.SelectionId": u },
      { $set: { "session.$.MarkStatus": v } }
    );
    console.log("Document updated successfully:", result);
    return result;
  } catch (err) {
    console.error("Error updating document:", err);
    throw err; // Re-throw the error to handle it elsewhere if needed
  }
};


const updateOdds = async(e,u,v)=>{return await Odds.updateOne({market_id: e, "runners.selectionId": u},{$set: {"runners.$.status":v}})};
const updateMatchClear = async(e,u,v)=>{return await Odds.updateOne({market_id: e},{status:v})};

const updateBM = async(e,u,v)=>{return await BM.updateOne({marketId: e,nat:u},{s:v})};
const updateBMStatus = async(e,u,v)=>{return await BM.updateOne({marketId: e,nat:u},{status:v})};

const findOddsBetByMatch = async (matchId, uid, sts) => { return await BetOdds.find({ matchId: matchId, userId: uid, status:sts }).sort({ _id: -1 }) };
const findFancyBetByMatch = async (matchId, uid, sts) => { return await BetFancy.find({ matchId: matchId, userId: uid, status:sts }).sort({ _id: -1 }) };
const findBMBetByMatch = async (matchId, uid, sts) => { return await BetBM.find({ matchId: matchId, userId: uid, status:sts }).sort({ _id: -1 }) };

const findAllOddsBetByUserId = async (uid) => { return await BetOdds.find({ userId: uid }).sort({ _id: -1 }) };
const findAllFancyBetByUserId = async (uid) => { return await BetFancy.find({ userId: uid }).sort({ _id: -1 }) };
const findAllBMBetByUserId = async (uid) => { return await BetBM.find({ userId: uid }).sort({ _id: -1 }) };

const findAllOddsBet = async () => { return await BetOdds.find().populate('userId', "fullname username") };
const findAllFancyBet = async () => { return await BetFancy.find().populate('userId', "fullname username") };
const findAllBMBet = async () => { return await BetBM.find().populate('userId', "fullname username") };

const getOdsByMML =async(b,c,d,e) =>{return await Odds.find({eventID: b, "runners.selectionId":c})}
const getOdsByMMB =async(b,c,d,e) =>{return await Odds.find({eventID: b, "runners.selectionId":c})}

const getBMByMMB = async(a,b,c,d) =>{return await BM.find({ComponentId:a,nat:b,b1:c,bs1:d})}
const getBMByMML = async(a,b,c,d) =>{return await BM.find({ComponentId:a,nat:b,l1:c,ls1:d})}

const getFancyByMMB = async(a,b,c,d) =>{return await Session.find({matchId:a, "session.SelectionId":b,"session.BackPrice1":c, "session.BackSize1":d})}
const getFancyByMML = async(a,b,c,d) =>{return await Session.find({matchId:a, "session.SelectionId":b,"session.LayPrice1":c, "session.LaySize1":d})}


const getAllOddsBetBySec = async (mkt, sts) => { return await BetOdds.find({marketId:mkt,status:sts}) };
const getAllBMBetBySec = async (mkt, sts) => { return await BetBM.find({marketId:mkt,status:sts}) };
const getAllFancyBetBySec = async (mkt,sId, sts) => { return await BetFancy.find({marketId:mkt,sectionId:sId,status:sts}) };
// const updateUserWalletExposerByID = async (userid, balance, expo) => { return await User.findOneAndUpdate(userid, { $inc: { balance: balance, exposerAmount: -expo  } }, { new: true }) };
// const updateUserLib = async (userid, expo) => { return await User.findOneAndUpdate(userid, { $inc: { exposerAmount: -expo  } }, { new: true }) };
const updatedOddsBetStatusByID = async(betId, sts, result) => { return await await BetOdds.findByIdAndUpdate(betId, { status: sts, result: result })};
const updatedBMBetStatusByID = async(betId, sts, result) => { return await await BetBM.findByIdAndUpdate(betId, { status: sts, result: result })};
const updatedFancyBetStatusByID = async(betId, sts, result) => { return await await BetFancy.findByIdAndUpdate(betId, { status: sts, result: result })};

const updateUserWalletExposerByID = async (userId, balanceChange, exposerChange, profitLoss) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $inc: { balance: balanceChange, exposerAmount: exposerChange, profit_loss:profitLoss } },
            { new: true }
        );
        if (!updatedUser) {
            console.log(`User with ID ${userId} not found`);
        }
        return updatedUser;
    } catch (error) {
        console.error("Error updating user wallet and exposer:", error);
        throw error;
    }
};
const updateUserLib = async (userId, exposerChange) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $inc: { exposerAmount: exposerChange, profit_loss:exposerChange } },
            { new: true }
        );
        if (!updatedUser) {
            console.log(`User with ID ${userId} not found`);
        }
        return updatedUser;
    } catch (error) {
        console.error("Error updating user wallet and exposer:", error);
        throw error;
    }
};


const saveBet = async (newBet) => {
    return new Promise((resolve, reject) => {
        newBet.save((err, result) => {
            if (err) { reject(err) }
            else { resolve(result) }
        })
    })
};






const getAllSeries = async (gId) => {
    console.log('dataAllSeries', gId)
    // try {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://dream.bagpackkar.com/d110923/shyamp/getSeries?sport_id=${gId}`,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const response = await axios.request(config);
    if (response.length <= 0) { return }
    let data = response.data;
	for(let i ; data.length>i;i++){
        Competition.findOneAndUpdate(
            { competitionID: data.competition.id }, // The query to find the document
            { EventTypeID: gId, competitionName: data.competition.name, marketCount: data.marketCount, competitionRegion: data.competitionRegion, lastUpdate: Date.now() }, // The new data to update or insert
            { upsert: true },
            (err, bm) => {
                if (err) {
                    console.error('Error:', err);
                }
            }
        ).clone().catch(function (err) { console.log('clone') })
    }
    return response.data;
    // } catch (error) {
    //   console.error(error);
    //   return { status: false, msg: 'Error fetching games', data: [] };
    // }
}



const getAllMatch = async (gId, sId) => {
    console.log('get match', gId, sId)
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://dream.bagpackkar.com/d110923/shyamp//getMatches?series_id=${sId}&game_id=${gId}`,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const response = await axios.request(config);
		Match.updateMany({CompetitionID: sId},{status:0})
		Market.updateMany({CompetitionID: sId},{status:0})
		let data = response.data;
        for(let i=0; data.length>i; i++ ) {
            Match.findOneAndUpdate(
                { EventTypeID: gId, CompetitionID: sId },
                {
                    eventId: data[i].event.id,
                    marketId: data[i].marketId,
                    marketName: data[i].marketName,
                    marketStartTime: data[i].marketStartTime,
                    totalMatched: data[i].totalMatched,
                    runners: data[i].runners,
                    eventName: data[i].event.name,
                    eventCountry: data[i].event.countryCode,
                    timeZone: data[i].event.timezone,
                    openDate: data[i].event.openDate,
                    marketCount: data[i].marketCount,
                    scoreboard_id: data[i].scoreboard_id,
                    selection: data[i].selections,
                    liability: data[i].liability_type,
                    undeclared_market: data[i].undeclared_market
                },
                { upsert: true, new:true },
                (err, bm) => {
                    if (err) {
                        console.error('Error:', err);
                    }
                }
            ).clone().catch(function (err) { console.log('clone') })
            Market.findOneAndUpdate(
                { ComponentId: sId, EventID: data[i].event.id, marketId: data[i].marketId },
                {
                    GameId: gId,
                    marketName: data[i].marketName,
                    marketStartTime: data[i].marketStartTime,
                    totalMatched: data[i].totalMatched,
                    runners: data[i].runners
                },
                { upsert: true, new:true },
                (err, bm) => {
                    if (err) {
                        console.error('Error:', err);
                    }
                }
            ).clone().catch(function (err) { console.log('clone') })
            // console.log(match.event)
        }
        return response.data;
    } catch (error) {
        console.error(error);
        return { status: false, msg: 'Error fetching games', data: [] };
    }
}


// const getCheckMatch = async (gId, sId) => {
    
//     try {
//         let config = {
//             method: 'get',
//             maxBodyLength: Infinity,
//             // url: `https://dream.bagpackkar.com/d110923/shyamp//getMatches?series_id=${sId}&game_id=${gId}`,
// 			url: `https://dream.bagpackkar.com/d110923/shyamp/getOddsList?marketid=${mrktId}`,
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         };

//         const response = await axios.request(config);
//         console.log('get match', gId, sId, response.data)
//     } catch (error) {
//         console.error(error);
//         return { status: false, msg: 'Error fetching games', data: [] };
//     }
// }
// getCheckMatch(4, 12547929);

const getFancy = async (mId) => {
// console.log('hit on server');
  try {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://dream.bagpackkar.com/api/switch/getFancy?matchId=${mId}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const response = await axios.request(config);

    if (response.data.length > 0) {
      await Session.findOneAndUpdate(
        { matchId: mId },
        { session: response.data },
        { upsert: true, new: true }
      ).catch((err) => {
        console.error('Error updating document:', err);
      });
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return { status: false, msg: 'Error fetching games', data: [] };
  }
};

// getFancy(32997580)
const getBookMaker = async (mId) => {
// console.log('hit on server');
  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://dream.bagpackkar.com/api/switch/getBM?matchId=${mId}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };

  	const response = await axios.request(config);
  	// console.log(response.data)
  	let res = response.data;
  	for (let i=0; i<res.length; i++) {
        await BM.findOneAndUpdate(
          { ComponentId: mId, nat: res[i].nat },
          {
            marketId: res[i].mid,
            mname: res[i].mname,
            remark: res[i].remark,
            remark1: res[i].remark1,
            min: parseInt(res[i].min),
            max: parseInt(res[i].max),
            sid: parseInt(res[i].sid),
            b1: parseInt(res[i].b1),
            bs1: parseInt(res[i].bs1),
            l1: parseInt(res[i].l1),
            ls1: parseInt(res[i].ls1),
            s: res[i].s,
            sr: res[i].sr,
            gtype: res[i].gtype,
            utime: parseInt(res[i].utime),
            b2: parseInt(res[i].b2),
            bs2: parseInt(res[i].bs2),
            b3: parseInt(res[i].b3),
            bs3: parseInt(res[i].bs3),
            l2: parseInt(res[i].l2),
            ls2: parseInt(res[i].ls2),
            l3: parseInt(res[i].l3),
            ls3: parseInt(res[i].ls3),
            b1s: res[i].b1s,
            b2s: res[i].b2s,
            b3s: res[i].b3s,
            l1s: res[i].l1s,
            l2s: res[i].l2s,
            l3s: res[i].l3s,
          },
          { upsert: true, new: true }
        );
    }
  	return response.data;
  } catch (error) {
    console.error(error);
    return { status: false, msg: 'Error fetching games', data: [] };
  }
}

// bookgetmakeBookMaker(32996016);
const getOdds = async (mrktId, gId, cId, eId) => {
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://dream.bagpackkar.com/d110923/shyamp/getOddsList?marketid=${mrktId}`,
            headers: { 'Content-Type': 'application/json' }
        };
        const response = await axios.request(config);
        let data = response.data;
        await Odds.findOneAndUpdate(
            { market_id: mrktId },
            {
                gameId: gId,
                comptationId: cId,
                eventID: eId,
                status: data[0].status,
                inplay: data[0].inplay,
                runners: data[0].runners,
                updateTime: data[0].updateTime,
                lastUpdate: Date.now(),
                oddsSatus: 1
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return { status: false, msg: 'Error fetching games', data: [] };
    }
}




// getOdds(1.224473872)

router.post('/sports', async (req, res) => {
    // console.log(req.body);
    let sports = await findSports(1);
    res.status(200).json({ status: true, msg: "sports type list", data: sports })
})

router.post('/sports/:id', async (req, res) => {
    // console.log(req.body);
    let sports = await findCompSportsByID(req.params.id, 1);
    // console.log(sports)
    res.status(200).json({ status: true, msg: "sports type list", data: sports })
})

router.post("/list", async (req, res) => {
    // console.log(req.header('token'))
    try {
        const sports = await findAllSports();
        // console.log(user[0].username)
        return res.status(200).json({ status: true, msg: "Sports List", data: sports });
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/update/sports", async (req, res) => {
    // console.log("data",req.body)
    try {
        let update = await updateSports(req.body.eventType, req.body.status);
        // console.log(update)
        const sports = await findAllSports();
        return res.status(200).json({ status: true, msg: "Updated Sports List", data: sports });

    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})


router.post("/:name/sports", async (req, res) => {
    // console.log("data",req.params)
    // try {
    let series = await findCompetition(req.params.name);
    // console.log(series)
    //     const sports = await findAllSports();
    return res.status(200).json({ status: true, msg: "Series List", data: series });

    // } catch (err) {
    //     return res.status(500).json({ status: false, msg: "Not Found" });
    // }
})

router.post("/update/competition/:pre", async (req, res) => {
    console.log("data", req.body, req.params.pre)
    try {
        let update = await updateCompetition(req.body.eventType, req.body.status);
        // console.log(update)
        const comp = await findCompetition(req.params.pre);
        return res.status(200).json({ status: true, msg: "Updated Sports List", data: comp });

    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/:comp/match", async (req, res) => {
    console.log("Match data", req.params, req.body)
    try {
        let series = await MatchById(req.params.comp);
        console.log("jkfjsdlkjf", series, req.params)
        //     const sports = await findAllSports();
        return res.status(200).json({ status: true, msg: "Match List", data: series });

    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post('/match/update/:id', async (req, res) => {
    console.log(req.body);
    try {
        let update = await MatchUpdate(req.params.id, req.body.status)
        let series = await MatchById(req.body.comp);
        // console.log(series)
        res.status(200).json({ status: true, msg: "sports type list", data: series })
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/market/list", async (req, res) => {
    // console.log(req.header('token'))
    try {
        const sports = await findAllEvents();
        // console.log(user[0].username)
        return res.status(200).json({ status: true, msg: "Sports List", data: sports });
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/:event/event", async (req, res) => {
    console.log("data", req.params)
    try {
        let series = await findMarket(req.params.event);
        // console.log(series)
        //     const sports = await findAllSports();
        return res.status(200).json({ status: true, msg: "Series List", data: series });

    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/market/update/:pre", async (req, res) => {
    console.log("data", req.body, req.params.pre)
    try {
        let update = await updateMarket(req.body.eventId, req.body.status);
        // console.log(update)
        let series = await findMarket(req.body.eventId);
        // console.log(series)
        return res.status(200).json({ status: true, msg: "Updated Sports List", data: series });

    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})

router.post("/event/list", async (req, res) => {
    console.log("data", req.params)
    try {
        let series = await findAllMarket();
        // console.log(series)
        //     const sports = await findAllSports();
        return res.status(200).json({ status: true, msg: "Series List", data: series });

    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})


router.post('/home/sports/:id', async (req, res) => {
    // console.log(req.params.id)
    let data = [];
    // let loopexpire=false;
    try {
    	let sports = await findSports(1);
let odds = [];
let Match = [];
let promises = sports.map(async (sport) => {
    let allOdds = await findOddsByGameID(sport.eventType, 'OPEN');
    odds = odds.concat(allOdds);
	let Matchs = await MatchByETypeId(sport.eventType, 1);
	Match = Match.concat(Matchs)
});

await Promise.all(promises);

const newArray = odds.map((item1) => {
    const matchingItem = Match.find((item2) => item1.eventID === item2.eventId && item1.status === 'OPEN' && item2.status === 1);
	const getName = (id) =>{
    	let names = sports.find(item => item.eventType === id);
		return  names ? names.name : null;
		}
    // console.log(sports)
    if (matchingItem) {
        const marketStartTime = new Date(matchingItem.marketStartTime).getTime();
        const currentTime = Date.now();

        if (marketStartTime < currentTime) {
            if (item1.inplay) {
                return {
					GameId:matchingItem.EventTypeID,
                	Gamename: getName(matchingItem.EventTypeID),
                    market_id: item1.market_id,
                    oddsRunner: item1.runners,
                    inplay: item1.inplay,
                    oddsStatus: item1.status,
                    eventID: item1.eventID,
                    updateTime: item1.updateTime,
                    marketStartTime: matchingItem.marketStartTime,
                    marketId: matchingItem.marketId,
                    eventName: matchingItem.eventName,
                    timeZone: matchingItem.timeZone,
                    marketRunner: matchingItem.runners
                };
            } else {
                return null;
            }
        } else {
            return {
            	GameId:matchingItem.EventTypeID,
                Gamename: getName(matchingItem.EventTypeID),
                market_id: item1.market_id,
                oddsRunner: item1.runners,
                inplay: item1.inplay,
                oddsStatus: item1.status,
                eventID: item1.eventID,
                updateTime: item1.updateTime,
                marketStartTime: matchingItem.marketStartTime,
                marketId: matchingItem.marketId,
                eventName: matchingItem.eventName,
                timeZone: matchingItem.timeZone,
                marketRunner: matchingItem.runners
            };
        }
    } else {
        return null;
    }
}).filter(Boolean);

newArray.sort((a, b) => {return (a.inplay === b.inplay) ? 0 : a.inplay ? -1 : 1;});

    const groupedByInplay = newArray.reduce((acc, item) => {
                      if (!acc[item.inplay]) {
                        acc[item.inplay] = [];
                      }
                      acc[item.inplay].push(item);
                      return acc;
                    }, {})
                    // console.log(groupedByInplay.true )
      let ndata = [groupedByInplay.true,groupedByInplay.false]
			// console.log(ndata)
        res.status(200).json({ status: true,data: ndata, match:Match , odds:odds })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ status: false, error: "Internal server error" });
    }


})



router.post('/bet/:token', async (req, res) => {
    // console.log(req.params.token, req.body);
    let user = await findUsername(req.params.token);
    // console.log(user[0])

    if (user[0].balance < req.body.liblity) {
        res.send({ status: false, msg: 'Low wallet balance' })
        return;
    }
	if (user[0].bet_status === 'N') {
        res.send({ status: false, msg: 'Bet Locked' })
        return;
    }
	let check =[];
    if (req.body.data[5] === 'odds') {
		// if(req.body.data[3] === 'back'){
		check = await getOdsByMMB(req.body.data[4].matchId,req.body.data[2]);
        console.log(check[0], )
        // }else{
		// check = await getOdsByMML(req.body.data[4].matchId,req.body.data[2]);
        // }
    	console.log(check, req.body, req.body.data[4].matchId,req.body.data[2], req.body.data[0].price, req.body.data[0].size)
		if(check.length === 0 ){
        	res.send({ status: false, msg: 'Bet not placed. Odds changed' })
        	return;
		}else{
        const newBet = new BetOdds({
            userId: user[0]._id,
            profit: req.body.profit,
            liblity: req.body.liblity,
            amount: req.body.amount,
            matchId: req.body.data[4].matchId,
            marketId: req.body.data[4].marketId,
            sectionId: req.body.data[2],
            odds: req.body.data[1],
            betType: req.body.data[3],
            price: req.body.data[0].price,
            size: req.body.data[0].size,
        });
        const savedBet = await saveBet(newBet);
        let bets = await findOddsBetByMatch(req.body.data[4].matchId, user[0]._id, 1)
        let bets1 = await findFancyBetByMatch(req.body.data[4].matchId, user[0]._id, 1)
		let bets2 = await findBMBetByMatch(req.body.data[4].matchId, user[0]._id, 1)
        // console.log({res:savedBet, status: true, msg: "Bet Placed successfully", amount:{balance:(user[0].balance - req.body.liblity), expo:(user[0].exposerAmount + parseInt(req.body.liblity)) } })
        let update = await updateUserWalletExposer(user[0].username, (user[0].balance - req.body.liblity), (user[0].exposerAmount + parseInt(req.body.liblity)));
        return res.status(200).json({ status: true, msg: "Bet Placed successfully", bets: bets, fancy: bets1, bmBets:bets2, amount: { balance: (user[0].balance - req.body.liblity), expo: (user[0].exposerAmount + parseInt(req.body.liblity)) } })
    }} else if(req.body.data[5] === 'fancy') {
		// if(req.body.data[3] === 'Yes'){
    	check = await getFancyByMMB(req.body.data[4].marketId, req.body.data[2]);
        // }else{
        // check = await getFancyByMML(req.body.data[4].marketId, req.body.data[2], req.body.data[0].price, req.body.data[0].size,);
        // }
		if(check.length === 0 ){
        	res.send({ status: false, msg: 'Bet not placed. Odds changed' })
        	return;
		}else{
		const newBet = new BetFancy({
		userId: user[0]._id,
		amount: req.body.amount,
		profit: req.body.profit,
		liblity: req.body.liblity,
		amount: req.body.amount,
		matchId: req.body.data[4].matchId,
		marketId: req.body.data[4].marketId,
		sectionId: req.body.data[2],
		fancy: req.body.data[1],
		betType: req.body.data[3],
		price: req.body.data[0].price,
		size: req.body.data[0].size,
		});
		const savedBet = await saveBet(newBet);
		let bets = await findOddsBetByMatch(req.body.data[4].matchId, user[0]._id, 1)
		let bets1 = await findFancyBetByMatch(req.body.data[4].matchId, user[0]._id, 1)
		let bets2 = await findBMBetByMatch(req.body.data[4].matchId, user[0]._id, 1)
        let update = await updateUserWalletExposer(user[0].username, (user[0].balance - req.body.liblity), (user[0].exposerAmount + parseInt(req.body.liblity)));
		// console.log({res:savedBet, status: true, msg: "Bet Placed successfully", amount:{balance:(user[0].balance - req.body.liblity), expo:(user[0].exposerAmount + parseInt(req.body.liblity)) } })
		return res.status(200).json({ status: true, msg: "Bet Placed successfully", bets: bets, fancy: bets1, bmBets:bets2, amount: { balance: (user[0].balance - req.body.liblity), expo: (user[0].exposerAmount + parseInt(req.body.liblity)) } })
    }}else if(req.body.data[5] === 'bookmaker') {
    	// if(req.body.data[3]==='back'){
			check = await getBMByMM(req.body.data[4].marketId, req.body.data[2]);
    	// }else{
        	// check = await getBMByMM(req.body.data[4].marketId, req.body.data[2], req.body.data[0].price, req.body.data[0].size);
		// }
		if(check.length === 0 ){
        	res.send({ status: false, msg: 'Bet not placed. Odds changed' })
        	return;
		}else{
		const newBet = new BetBM({
		userId: user[0]._id,
		amount: req.body.amount,
		profit: req.body.profit,
		liblity: req.body.liblity,
		amount: req.body.amount,
		matchId: req.body.data[4].matchId,
		marketId: req.body.data[4].marketId,
		sectionId: req.body.data[2],
		bookmaker: req.body.data[1],
		betType: req.body.data[3],
		price: req.body.data[0].price,
		size: 0,
		});
		const savedBet = await saveBet(newBet);
		// console.log('bookmaker');
		let bets = await findOddsBetByMatch(req.body.data[4].matchId, user[0]._id, 1)
		let bets1 = await findFancyBetByMatch(req.body.data[4].matchId, user[0]._id, 1)
		let bets2 = await findBMBetByMatch(req.body.data[4].matchId, user[0]._id, 1)
        let update = await updateUserWalletExposer(user[0].username, (user[0].balance - req.body.liblity), (user[0].exposerAmount + parseInt(req.body.liblity)));
		// console.log({res:savedBet, status: true, msg: "Bet Placed successfully", amount:{balance:(user[0].balance - req.body.liblity), expo:(user[0].exposerAmount + parseInt(req.body.liblity)) } })
		return res.status(200).json({ status: true, msg: "Bet Placed successfully", bets: bets, fancy: bets1, bmBets:bets2, amount: { balance: (user[0].balance - req.body.liblity), expo: (user[0].exposerAmount + parseInt(req.body.liblity)) } })
    }
    }
})

router.post("/statementUserBet", async (req, res) => {
    console.log(req.header('token'), req.body)
    const user = await findUsername(req.body.username);
    let bets = await findAllOddsBetByUserId(user[0]._id)
    let bets1 = await findAllFancyBetByUserId(user[0]._id)
	let bets2 = await findAllBMBetByUserId(user[0]._id)
    bets = bets.concat(bets1);
	let totalBet = bets.concat(bets2)
    console.log(totalBet)
    const sortedbetDescending = totalBet.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({ status: true, bets: sortedbetDescending })
})

router.post("/statementUser", async (req, res) => {
    console.log(req.header('token'), req.body)
    try {
        
		const user = await findUsername(req.body.username);
    	    let bets = await findTransaction(user[0]._id)
    // console.log(bets, bets2)
    const sortedbetDescending = bets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return res.status(200).json({ status: true, msg: "Bet List", bet:sortedbetDescending});
    } catch (err) {
        return res.status(500).json({ status: false, msg: "Not Found" });
    }
})


router.post('/betlist', async (req, res) => {
    let bets = await findAllOddsBet()
    let bets1 = await findAllFancyBet()
	let bets2 = await findAllBMBet()
    bets = bets.concat(bets1);
	let totalBet = bets.concat(bets2)
    const sortedbetDescending = totalBet.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({ status: true, bets: totalBet})
})

router.post('/bethistory/:token', async (req, res) => {


    let user = await findUser({ hash_new: req.params.token });

    let bets = await findAllOddsBetByUserId(user[0]._id)
    let bets1 = await findAllFancyBetByUserId(user[0]._id)
	let bets2 = await findAllBMBetByUserId(user[0]._id)
    bets = bets.concat(bets1);
	let totalBet = bets.concat(bets2)
    // console.log(bets, bets2)
    const sortedbetDescending = totalBet.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({ status: true, bets: sortedbetDescending })
})







// router.post('/sportsUser', async (req, res) => {
//     // console.log(req.body);
//     let sports = await findSports(1);
// 	console.log(sports);
// 	const newData = [];
// 	for(let i=0, sports.length > i; i++){
    	
//     }
//     res.status(200).json({ status: true, msg: "sports type list", data: sports })
// })

router.get('/UserMenu', async (req, res) => {

    // let user = await findUser({hash_new:req.headers.token})
    // if(user.length>0){
    let data = await findSports(1);
    // }
    // console.log(req.headers.token,user[0].hash_new)

    res.send({ status: true, Event: data })
})

router.get('/EventsMenu', async (req, res) => {

    // let user = await findUser({hash_new:req.headers.token})
    // if(user.length>0){
    let event1 = await findSports(1);
    let event2 = await findSports(0);
    let data = event1.concat(event2);
    // }
    // console.log(req.headers.token,user[0].hash_new)

    res.send({ status: true, Event: data })
})

router.post('/EventList', async (req, res) => {

    let lastUpdate = await findCompetition(req.body.eventType);
    // console.log(Date.now(), lastUpdate[0])
    // if((Date.now()-lastUpdate[0].lastUpdate) > 1000){
    // getAllSeries(req.body.eventType);
    // }

    let name = await findSportsByID(req.body.eventType);
    let data = await findCompetition(req.body.eventType);
    let Match = await MatchByETypeId(req.body.eventType);
    // console.log(Match[0])

    let matchCount = await Promise.all(data.map(async (value, i) => {
        return Match.filter(item => item.CompetitionID === value.competitionID && item.status === 1).length;
    }));



    // 	const allMarket = [];

    // data.forEach(item1 => {
    //     Match.forEach(item2 => {
    //         if (item1.competitionID === item2.CompetitionID && item1.EventTypeID === item2.EventTypeID) {
    //             const newItem = { marketId: item2.eventId, eventName:item2.eventName, marketId:item2.marketId, marketName:item2.marketName, runners: item2.runners, marketStartTime:item2.marketStartTime, marketStatus:item2.status, openDate:item2.openDate, timeZone:item2.timeZone, competitionName:item1.competitionName, competitionRegion:item1.competitionRegion, ComplastUpdate:item1.lastUpdate, MarketlastUpdate:item2.lastUpdate, CompStatus:item1.status};
    //             allMarket.push(newItem);
    //         }
    //     });
    // });

    res.send({ status: true, EventData: data, name: name[0].name, matchCount: matchCount, });
});

router.post('/live/:token', async (req, res) => {
// 	 console.log(req.body)
	let market = [];
	let check = await findOddsByMarket(req.body.marketId);
	market = await findMarket(check[0].eventID);
	// console.log(market)
	if(market.length === 0){
    	res.status(200).json({ status: true,});
    	return;
	}
	if(check.length > 0){
    	let difference = Date.now() - check[0].lastUpdate;
    	console.log('difference ' + difference,  Date.now(), check[0].lastUpdate)
	if (difference > 900) {
	if(check[0].gameId === 4){
		await getFancy(check[0].eventID);
		await getBookMaker(check[0].eventID);
	}
		await getOdds(market[0].marketId, market[0].GameId, market[0].ComponentId, market[0].EventID);
	}else{ console.log('Time less than'); }
	}
	let bm = await findBMByMatch(market[0].EventID)
//     // console.log('bookmaker',req.body.matchId, bm.length)
    let session = await findSession(market[0].EventID)
//     // console.log("session", session)
    let odds = await findOddsByMarket(market[0].marketId)
    let match = await MatchByEId(market[0].EventID);
	let user = await findUser({ hash_new: req.params.token });
    let bets = await findOddsBetByMatch(market[0].EventID, user[0]._id, 1)
    let bets1 = await findFancyBetByMatch(market[0].EventID, user[0]._id, 1)
	let bets2 = await findBMBetByMatch(market[0].EventID, user[0]._id, 1)
//     // let totalBet = bets.concat(bets1);
    // console.log(req.body.matchId, user[0]._id)
    res.status(200).json({ status: true, match, market, session, odds, bm:bm, bets: bets, fancy: bets1, bmBets:bets2 })
})

router.post('/MatchList', async (req, res) => {
    let data = [];
	let check = await findMarketByCID(req.body.competitionID);
	if(check.length <= 0){
		return res.send({ status: true, MatchData: data, MarketData: [], name: '', market: [] })
	}
	if((Date.now() - check[0].lastUpdate)>100000){
		await getAllMatch(req.body.eventType, req.body.competitionID)
	}
	///// check latsest update by event of odds

    // let user = await findUser({hash_new:req.headers.token})
    let name = await findCompetitionByComp(req.body.competitionID, req.body.eventType);
    // // if(user.length>0){
    // let comp1 = await MatchByCIdSId(req.body.competitionID, req.body.eventType, 1);
    // let comp2 = await MatchByCIdSId(req.body.competitionID, req.body.eventType, 0);
    // data = comp1.concat(comp2);
    let market = await findMarketByCID(req.body.competitionID);
    // // }
    // // console.log(market)
    // let marketSystem = await Promise.all(data.map(async (value, i) => {
    //     return market.filter(item => item.CompetitionID === value.competitionID && item.EventID === value.eventId && item.status === 1);
    // }));
    res.send({ status: true, MarketData: market, name: name[0]})
})

router.post('/MatchData', async (req, res) => {
    console.log(req.body)
	let market = [];
	let check = await findOddsByMarket(req.body.id);
	market = await findMarket(req.body.event);
	// console.log(check, market[0].marketId, market[0].GameId, market[0].ComponentId, market[0].EventID)
	if(market.length === 0){
    	res.status(200).json({ status: true,});
    	return;
	}
	if(check.length > 0){
    	let difference = Date.now() - check[0].lastUpdate;
    	// console.log('difference ' + difference,  Date.now(), check[0].lastUpdate)
	if (difference > 900) {
	if(check[0].gameId === 4){
		await getFancy(check[0].eventID);
		await getBookMaker(check[0].eventID);
	}
		await getOdds(market[0].marketId, market[0].GameId, market[0].ComponentId, market[0].EventID);
	}else{ console.log('Time less than'); }
	}
    // let user = await findUser({hash_new:req.headers.token})
    let session = await findSession(req.body.event);
    let odds = await findOddsByMarket(req.body.id);
    let bm = await findBMByMatch(req.body.event);

    // console.log(bm)
    // console.log(market, session, bm, market)
    if (odds.length > 0 || odds[0]) {
        const combinedArray = odds[0].runners.map((runner1) => {
            const matchingRunner2 = market[0].runners.find((runner2) => runner2.selectionId === runner1.selectionId);
            return {
                ...runner1,
                runnerName: matchingRunner2 ? matchingRunner2.runnerName : null,
            };
        });

        odds = { inplay: odds[0].inplay,
                runners: combinedArray,
                status: odds[0].status,
                oddsStatus:odds[0].oddsStatus,
                marketname: market[0].name,
                marketStatus: market[0].status,
                updateTime: odds[0].updateTime,
                marketStartTime: market[0].marketStartTime,
				 }
    }
    // if(user.length>0){
    // let comp1 = await MatchByCIdSId(req.body.competitionID,req.body.eventType, 1);
    // let comp2 = await MatchByCIdSId(req.body.competitionID,req.body.eventType, 0);
    // data = comp1.concat(comp2);
    // }
    // console.log(name[0])

    res.send({ status: true, fancy: session, odds: odds, bm: bm })
})


// router.post('/Home/List:token', async (req, res)=>{
// let data = [];

// res.send({status:true, data:data})
// })

router.post('/control', async (req, res) => {
// {control: 'fancy',type: 'suspand',value: 1,event: { id: '1.224552318', event: '33002028' },unique: '314'} 60gc2v1rps2enw5hbx5kx1r80yuw604r
    // console.log(req.body, req.headers.token)
	if(req.body.control === 'fancy'){
		if(req.body.type === 'suspand'){
			let update = await updateFancy(req.body.event.event,req.body.unique,req.body.value === 1 ? 'OPEN':'SUSPENDED');
		}
		if(req.body.type === 'status'){
			console.log(req.body.event.event,req.body.unique, req.body.value ===1 ? 'OPEN' : 'CLOSE')
			const updatestatus = updateFancyStatus(req.body.event.event,req.body.unique, req.body.value ===1 ? 'OPEN' : 'SUSPENDED');
		}
		if(req.body.type === 'rollback'){
			console.log('checkRollBack');
			let bets = await getAllFancyBetBySec(req.body.event.id, req.body.unique, 0);
			console.log(bets)
			bets.forEach(bet => {
			if(bet.result[0] === 'L'){
				updateUserWalletExposerByID(bet.userId, +bet.liblity, 0, +bet.liblity)
			}else{
            	updateUserWalletExposerByID(bet.userId, -bet.profit, 0, -bet.profit)
            }
		// updateUserWalletExposerByID(bet.userId, bet.profit+bet.liblity, -bet.liblity, bet.profit);
		updatedFancyBetStatusByID(bet._id, 2, 'Dismiss')
});
		}
	}
	if(req.body.control === 'odds'){
		if(req.body.type === 'suspand'){
			// console.log(req.body.event.id,req.body.unique,req.body.value === 1 ? 'ACTIVE' : 'SUSPENDED')
			let updatestatus = updateOdds(req.body.event.id,req.body.unique,req.body.value === 1 ? 'ACTIVE' : 'SUSPENDED');
		}
		if(req.body.type === 'status'){
			let updatestatus = updateOdds(req.body.event.id,req.body.unique,req.body.value === 1 ? 'ACTIVE' : 'SUSPENDED');
		}
		if(req.body.type === 'clear'){
			console.log('check odds clear')
			let updatestatus = updateMatchClear(req.body.event.id,req.body.unique,req.body.value === 1 ? true : false);
		}
		if(req.body.type === 'rollback'){
			let bets = await getAllOddsBetBySec(req.body.event.id,0);
			let bets1 = await getAllOddsBetBySec(req.body.event.id,1);
        	bets=bets.concat(bets1);
			console.log('bets length', bets.length);
			for(let i=0; bets.length>i; i++) {
            	// console.log('bets length', i, bets[i].sectionId, req.body.unique);
				if (bets[i].sectionId === req.body.unique) {
				if (bets[i].betType === 'back') {
                		// console.log('profit, back', bets[i].userId, bets[i].profit, -bets[i].liblity);
						await updateUserWalletExposerByID(bets[i].userId, -(bets[i].profit), 0, -bets[i].profit);
				} else if (bets[i].betType === 'lay') {
						console.log('loss, back');
						await updateUserWalletExposerByID(bets[i].userId, bets[i].liblity, 0, bets[i].liblity);
				}
				}else{
					if (bets[i].betType === 'back') {
						console.log('profit, lay');
						await updateUserWalletExposerByID(bets[i].userId, bets[i].liblity, 0, bets[i].liblity);
				} else if (bets[i].betType === 'lay') {
						console.log('profit, lay');
						await updateUserWalletExposerByID(bets[i].userId, -(bets[i].profit), 0, -bets[i].profit);
				}
				}
				
				await updatedOddsBetStatusByID(bets[i]._id, 2, 'Dismiss')
			}
		}
		if(req.body.type === 'declare'){
			let bets = await getAllOddsBetBySec(req.body.event.id,1);
			console.log('bets length', bets.length);
			for(let i=0; bets.length>i; i++) {
            	// console.log('bets length', i, bets[i].sectionId, req.body.unique);
				if (bets[i].sectionId === req.body.unique) {
				if (bets[i].betType === 'back') {
                		// console.log('profit, back', bets[i].userId, bets[i].profit, -bets[i].liblity);
						await updateUserWalletExposerByID(bets[i].userId, bets[i].profit+bets[i].liblity, -bets[i].liblity, bets[i].profit);
                		await updatedOddsBetStatusByID(bets[i]._id, 0, 'WIN')
				} else if (bets[i].betType === 'lay') {
						console.log('loss, back');
						await updateUserLib(bets[i].userId, -bets[i].liblity);
						await updatedOddsBetStatusByID(bets[i]._id, 0, 'LOOSE')
				}
				}else{
					if (bets[i].betType === 'back') {
						console.log('profit, lay');
						await updateUserLib(bets[i].userId, -bets[i].liblity);
						await updatedOddsBetStatusByID(bets[i]._id, 0, 'LOOSE')
				} else if (bets[i].betType === 'lay') {
						console.log('profit, lay');
						await updateUserWalletExposerByID(bets[i].userId, bets[i].profit+bets[i].liblity, -bets[i].liblity, bets[i].profit);
						await updatedOddsBetStatusByID(bets[i]._id, 0, 'WIN')
				}
				}
			}
			// console.log('odds declare', req.body, bets)
		}
    }
	if(req.body.control === 'bm'){
		if(req.body.type === 'suspand'){
			// console.log(parseFloat(req.body.event.id),req.body.unique,req.body.value === 1 ? 'OPEN' : 'SUSPENDED');
			let update = updateBM(parseFloat(req.body.event.id),req.body.unique,req.body.value === 1 ? 'OPEN' : 'SUSPENDED');
		}
		if(req.body.type === 'status'){
			let updatestatus = updateBMStatus(parseFloat(req.body.event.id),req.body.unique, req.body.value);
		}
		if(req.body.type === 'rollback'){
			let bets = await getAllBMBetBySec(req.body.event.id,0);
        	let bets1 = await getAllBMBetBySec(req.body.event.id,1);
        	bets=bets.concat(bets1);
			console.log('bets length', bets.length);
			for(let i=0; bets.length>i; i++) {
            	// console.log('bets length', i, bets[i].sectionId, req.body.unique);
				if (bets[i].sectionId === req.body.unique) {
				if (bets[i].betType === 'back') {
                		// console.log('profit, back', bets[i].userId, bets[i].profit, -bets[i].liblity);
						await updateUserWalletExposerByID(bets[i].userId, -(bets[i].profit), 0, -bets[i].profit);
				} else if (bets[i].betType === 'lay') {
						console.log('loss, back');
						await updateUserWalletExposerByID(bets[i].userId, bets[i].liblity, 0, bets[i].liblity);
				}
				}else{
					if (bets[i].betType === 'back') {
						console.log('profit, lay');
						await updateUserWalletExposerByID(bets[i].userId, bets[i].liblity, 0, bets[i].liblity);
				} else if (bets[i].betType === 'lay') {
						console.log('profit, lay');
						await updateUserWalletExposerByID(bets[i].userId, -(bets[i].profit), 0, -bets[i].profit);
				}
				}
				
				await updatedBMBetStatusByID(bets[i]._id, 2, 'Dismiss')
			}
		}
		if(req.body.type === 'declare'){
			let bets = await getAllBMBetBySec(req.body.event.id,1);
			console.log('bets length', bets);
			for(let i=0; bets.length>i; i++) {
			// // console.log('bets length', i, bets[i].sectionId, req.body.unique);
				if (bets[i].sectionId === req.body.unique) {
				if (bets[i].betType === 'back') {
			// // console.log('profit, back', bets[i].userId, bets[i].profit, -bets[i].liblity);
						await updateUserWalletExposerByID(bets[i].userId, bets[i].profit+bets[i].liblity, -bets[i].liblity, bets[i].profit);
						await updatedBMBetStatusByID(bets[i]._id, 0, 'WIN')
				} else if (bets[i].betType === 'lay') {
			// 			console.log('loss, back');
						await updateUserLib(bets[i].userId, -bets[i].liblity);
						await updatedBMBetStatusByID(bets[i]._id, 0, 'LOOSE')
				}
				}else{
					if (bets[i].betType === 'back') {
			// 			console.log('profit, lay');
						await updateUserLib(bets[i].userId, -bets[i].liblity);
						await updatedBMBetStatusByID(bets[i]._id, 0, 'LOOSE')
				} else if (bets[i].betType === 'lay') {
			// 			console.log('profit, lay');
						await updateUserWalletExposerByID(bets[i].userId, bets[i].profit+bets[i].liblity, -bets[i].liblity, bets[i].profit);
						await updatedBMBetStatusByID(bets[i]._id, 0, 'WIN')
				}
				}
			}
		}
	}
    res.send({ status: true})
})

router.post('/control/fancy',async(req, res)=>{
// console.log('data', req.body);
let bets = await getAllFancyBetBySec(req.body.event.id, req.body.unique, 1);
// console.log(bets[0])

// let Win = [];
// let Loose=[];

bets.forEach(bet => {
  if (req.body.run <= bet.price) {
  	if (bet.betType === 'Yes') {
  		// Loose.push(bet);
		updateUserLib(bet.userId, -bet.liblity);
		updatedFancyBetStatusByID(bet._id, 0, 'LOOSE - '+req.body.run)
  	} else{
    	// Win.push(bet);
		updateUserWalletExposerByID(bet.userId, bet.profit+bet.liblity, -bet.liblity, bet.profit);
		updatedFancyBetStatusByID(bet._id, 0, 'WIN - '+req.body.run)
  	}
  }else{
	if (bet.betType === 'No') {
    	// Loose.push(bet);
		updateUserLib(bet.userId, -bet.liblity);
		updatedFancyBetStatusByID(bet._id, 0, 'LOOSE - '+req.body.run)
  	} else{
  		// Win.push(bet);
    	updateUserWalletExposerByID(bet.userId, bet.profit+bet.liblity, -bet.liblity, bet.profit);
		updatedFancyBetStatusByID(bet._id, 0, 'WIN - '+req.body.run)
  	}
	}
});

	

res.send({status:true, msg:'Update Successfully'})
})

module.exports = router