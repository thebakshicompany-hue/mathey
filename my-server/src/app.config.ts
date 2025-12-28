@@ .. @@
import config from "@colyseus/tools";
-import { monitor } from "@colyseus/monitor";
-import { playground } from "@colyseus/playground";
+import { MathGameRoom } from "./rooms/MathGameRoom";

/**
 * Import your Room files
 */
-import { MyRoom } from "./rooms/MyRoom";

export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
-        gameServer.define('my_room', MyRoom);
+        gameServer.define('math_game', MathGameRoom)
+            .filterBy(['gameMode', 'level'])
+            .sortBy({ clients: -1 });

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */
        app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        if (process.env.NODE_ENV !== "production") {
-            app.use("/", playground);
+            // Disable playground in favor of custom client
+            app.get("/", (req, res) => {
+                res.json({
+                    message: "Mathey Multiplayer Server",
+                    version: "1.0.0",
+                    rooms: ["math_game"],
+                    status: "running"
+                });
+            });
        }

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
-        app.use("/colyseus", monitor());

    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
+        console.log("🎮 Mathey Multiplayer Server starting...");
+        console.log("📚 Math Game Room configured");
+        console.log("🚀 Server ready for connections!");
    }
});