// src/lib/constants/mouseMovement.ts

export const EVENTS = {
    click: 'Left Click',
    contextmenu: 'Right Click',
    dblclick: 'Double Click',
    mouseover: 'Mouse Over'
  };
  
  export const INSTRUCTIONS = [
    {
      title: "Left Click",
      description: "Press the left mouse button once to interact with elements.",
      image: "https://cdn-icons-png.flaticon.com/512/3645/3645905.png"
    },
    {
      title: "Right Click",
      description: "Press the right mouse button to open context menus or perform secondary actions.",
      image: "https://cdn-icons-png.flaticon.com/512/3645/3645909.png"
    },
    {
      title: "Double Click",
      description: "Quickly press the left mouse button twice to perform special actions.",
      image: "https://cdn-icons-png.flaticon.com/512/11441/11441315.png"
    },
    {
      title: "Mouse Over",
      description: "Move your cursor over elements to trigger hover effects and interactions.",
      image: "https://cdn-icons-png.flaticon.com/512/178/178431.png"
    }
  ];
  
  export const EMOJIS = ['😊', '🤣', '👿', '🐻', '🎮', '🎲', '🎪', '😉', '👽', '😇', '🥶', '🐯'];

  export type GameLevel = {
    id: number;
    name: string;
    description: string;
    words: string[];
    timeLimit: number;
    requiredScore: number;
    codingTermsDescriptions: { [key: string]: string };
  };
  
  export type KeyboardRecord = {
    keyboard_id: string;
    mouse_keyboard_quest_id: string;
    student_id: string;
    completed: boolean;
    level1_score: number | null;
    level1_time: number | null;
    level2_score: number | null;
    level2_time: number | null;
    level3_score: number | null;
    level3_time: number | null;
    created_at: string;
    updated_at: string;
  };

  
export const LEVELS: GameLevel[] = [
    {
      id: 1,
      name: "Basic Characters",
      description: "Master the basic alphabet and numbers used in coding",
      words: [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
      ],
      codingTermsDescriptions: {
        a:'a',b: 'b',c: 'c',d: 'd',e: 'e',f: 'f',g: 'g',h: 'h',i: 'i',j: 'j',
        1:'1',2: '2',3: '3',4: '4', 5: '5',6: '6',7: '7',8: '8',9: '9',0: '0'
      },
      timeLimit: 20,
      requiredScore: 12
    },
    {
      id: 2,
      name: "Programming Keywords",
      description: "Practice common programming keywords and operators",
      words: [
        'switch', 'case', 'default', 'break', 'continue', 'do', 'try', 
        'catch', 'finally', 'throw', 'typeof', 'instanceof', 'delete', 
        'new', 'this', 'class', 'extends', 'super', 'import', 'export', 
        'async', 'await', 'yield', 'static', 'void', 'with', 'debugger', 
        'in', 'of', '&&', '||', '!', '>', '<', '>=', '<=', '++', '--', 
        '*', '/', '%', '-', '<<', '>>', '>>>', '&', '|', '^', '~', '?', ':'
      ],
      codingTermsDescriptions: {
        switch: "Checks multiple options and runs the code for the first match.",
        case: "Defines an option inside a 'switch' statement.",
        default: "Runs if no other 'case' matches in a 'switch' statement.",
        break: "Stops a loop or a 'switch' statement from running further.",
        continue: "Skips to the next step in a loop, ignoring the rest of the code in this step.",
        do: "Runs a block of code at least once, then keeps running if a condition is true.",
        try: "Tests a piece of code to see if it works without errors.",
        catch: "Handles any errors that happen in a 'try' block.",
        finally: "Runs code after 'try' and 'catch', no matter what happens.",
        throw: "Sends out an error message when something goes wrong.",
        typeof: "Checks the type of a value (like a number or a word).",
        instanceof: "Checks if an object belongs to a specific category.",
        delete: "Removes something, like a property from an object.",
        new: "Creates something new, like an object or an instance of a class.",
        this: "Refers to the current object or context being used.",
        class: "A blueprint for creating objects with similar features.",
        extends: "Lets a class borrow features from another class.",
        super: "Calls the parent class's features in a child class.",
        import: "Brings in code from another file or module.",
        export: "Shares code from this file to be used in another file.",
        async: "Prepares a function to handle tasks that take time (like loading a file).",
        await: "Waits for a task to finish before moving to the next step.",
        yield: "Pauses a function and returns a value, but it can continue later.",
        static: "Creates a function or property that belongs to the class itself, not its objects.",
        void: "Says a function doesn't return any value.",
        with: "Used to simplify working with objects, but not commonly used now.",
        debugger: "Stops the program so you can look at its steps and fix problems.",
        in: "Checks if a property exists in an object or array.",
        of: "Goes through the values of an array or object.",
        "&&": "Checks if two conditions are true.",
        "||": "Checks if at least one condition is true.",
        "!": "Reverses a condition; 'not true' becomes 'false'.",
        ">": "Checks if a number is bigger than another.",
        "<": "Checks if a number is smaller than another.",
        ">=": "Checks if a number is bigger or equal to another.",
        "<=": "Checks if a number is smaller or equal to another.",
        "++": "Adds 1 to a number.",
        "--": "Takes away 1 from a number.",
        "*": "Multiplies two numbers.",
        "/": "Divides one number by another.",
        "%": "Finds the remainder when dividing two numbers.",
        "-": "Subtracts one number from another.",
        "<<": "Shifts the binary digits of a number to the left.",
        ">>": "Shifts the binary digits of a number to the right.",
        ">>>": "Shifts the binary digits of a number to the right without keeping the sign.",
        "&": "Compares bits and returns 1 if both are 1.",
        "|": "Compares bits and returns 1 if either is 1.",
        "^": "Compares bits and returns 1 if only one is 1.",
        "~": "Flips all the bits of a number (0 becomes 1, and 1 becomes 0).",
        "?": "Used in a shortcut for 'if' and 'else' (conditional operator).",
        ":": "Part of the shortcut for 'if' and 'else' (used with '?')."
      },
      timeLimit: 180,
      requiredScore: 30
    },
    {
      id: 3,
      name: "Terminal Commands",
      description: "Master common terminal commands and flags",
      codingTermsDescriptions: {
        echo: "Displays a line of text or variables in the terminal.",
        touch: "Creates a new empty file.",
        cat: "Displays the content of a file.",
        nano: "Opens a simple text editor in the terminal.",
        vim: "Opens a more advanced text editor in the terminal.",
        exit: "Closes the terminal or ends a session.",
        clear: "Clears all text on the terminal screen.",
        sudo: "Runs a command with superuser (admin) permissions.",
        chmod: "Changes the permissions of a file or folder.",
        chown: "Changes the owner of a file or folder.",
        grep: "Searches for a specific word or phrase in files.",
        find: "Locates files or folders based on criteria.",
        locate: "Quickly finds files or folders by name.",
        diff: "Compares the content of two files and shows the differences.",
        wget: "Downloads files from the internet using a URL.",
        curl: "Transfers data to or from a server, like downloading a file.",
        tar: "Combines multiple files into one file (called an archive).",
        zip: "Compresses files into a smaller, single file.",
        unzip: "Extracts files from a compressed zip file.",
        man: "Displays the manual or help for a command.",
        ps: "Shows a list of all running programs (processes).",
        top: "Displays running programs and their resource usage.",
        kill: "Stops a running program or process.",
        ping: "Checks if a computer or website is reachable.",
        ifconfig: "Shows or configures network settings (older tool).",
        ip: "Shows or configures network settings (newer tool).",
        whoami: "Displays the current user's name.",
        ssh: "Connects securely to another computer over a network.",
        scp: "Copies files between computers securely.",
        rsync: "Synchronizes files and folders between computers or locations.",
        alias: "Creates shortcuts for commands to make them easier to use.",
        history: "Shows a list of recently used commands.",
        ln: "Creates shortcuts (links) to files or folders.",
        "-a": "Shows all files, including hidden ones.",
        "-l": "Displays files in a detailed list format.",
        "-h": "Shows file sizes in a human-readable format.",
        "-i": "Asks for confirmation before doing something.",
        "--all": "Includes all items in a command, even hidden ones.",
        "--force": "Makes the command run without asking for confirmation.",
        "--recursive": "Applies the command to folders and their contents.",
        "--interactive": "Asks for confirmation before each action.",
        "--dry-run": "Shows what the command would do without making changes.",
        "--quiet": "Runs the command without showing any messages."
      },
      words: [
        'echo', 'touch', 'cat', 'nano', 'vim', 'exit', 'clear', 
        'sudo', 'chmod', 'chown', 'grep', 'find', 'locate', 
        'diff', 'wget', 'curl', 'tar', 'zip', 'unzip', 'man', 
        'ps', 'top', 'kill', 'ping', 'ifconfig', 'ip', 'whoami', 
        'ssh', 'scp', 'rsync', 'alias', 'history', 'ln', '-a', 
        '-l', '-h', '-i', '--all', '--force', '--recursive', 
        '--interactive', '--dry-run', '--quiet'
      ],
      timeLimit: 240,
      requiredScore: 35
    }
  ];