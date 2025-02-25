import { useEffect, useState } from "react";
import { BrowserRouter, useParams } from "react-router-dom";

// Import CSS for this page
import "./game.css";

// Import Adaptors
import { CentrifugeSetup, getGameData } from "../../adapters/game";
import { getLoggedInUserData } from "../../adapters/auth";

// Import Components
import Header from "../../components/Header";
import ChessBoard from "../../components/ChessBoard";
import SpectatorSideBar from "../../components/SpectatorSideBar";

function Game() {
  const [gameData, setGameData] = useState(null);
  const { game_id } = useParams();

  useEffect(() => {
    // Get game data
    getGameData(game_id).then((response) => {
      if (!response.data.success) {
        // TODO: Handle error with Toasts
        console.log("Unable to Get Game: ", response.data.message);
      } else {
        setGameData(response.data.data);
      }
    });
  }, []);

  let run_once = false;
  // Setup Centrifuge Setup
  if (gameData && !run_once) {
    CentrifugeSetup(game_id, (ctx) => {
      const websocket = ctx;
      switch (ctx.data.event) {
        case "join_game":
          // completed - DO NOT EDIT!!
          setGameData({ opponent: websocket.data.player });
          break;

        case "piece_moved":
          // completed - DO NOT EDIT!!
          gameData.moves.push(websocket.data.move);
          break;

        case "spectator_joined_game":
          // New Specator Joined Game Code Here
          console.log("centrifuge: a spectator just joined this game room");
          break;

        case "spectator_left_game":
          // New Specator Left Game Code Here
          console.log("centrifuge: a spectator just left this game room");
          break;

        // NOT IN USE AGAIN !!!! _ GO annd Beat @odizee / @emeka if ou question it
        // case "end_game":
        //   break;

        case "comments":
          // completed - DO NOT EDIT!!
          gameData.messages.push(websocket.data.comment);
          break;

        default:
          console.log("centrifuge: event listener not listened for", ctx?.data);
          break;
      }
    }).connect();
    run_once = true;
  }

  let BoardToRender = null;
  let SideBarToRender = null;

  // If GameData State has been set
  if (gameData !== null) {
    // If LoggedIn User is the owner of the Game
    if (gameData.owner?.user_id == getLoggedInUserData().user_id) {
      // Render the Chessboard with owner defaults
      BoardToRender = <ChessBoard type="owner" gameData={gameData} />;
      SideBarToRender = <SpectatorSideBar type="owner" gameData={gameData} />;
      // If LoggedIn User is the opponent in the Game
    } else if (gameData.opponent?.user_id == getLoggedInUserData().user_id) {
      // Render the Chessboard with opponent defaults
      BoardToRender = <ChessBoard type="opponent" gameData={gameData} />;
      SideBarToRender = <SpectatorSideBar type="opponent" gameData={gameData} />;
    } else {
      // Render the ChessBoard with spectator type
      BoardToRender = <ChessBoard type="spectator" gameData={gameData} />;
      SideBarToRender = <SpectatorSideBar type="spectator" gameData={gameData} />;
    }
  }

  return (
    <section className="main-game">
      <div className="main-chess">
        <Header />
        {BoardToRender}
      </div>
      {SideBarToRender}
    </section>
  );
}

export default Game;
