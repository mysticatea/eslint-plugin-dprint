import { execSync } from "child_process"
import { sync as rmdirSync } from "rimraf"

export const cd = (path: string) => {
    console.log("$ cd", path)
    process.chdir(path)
}

export const rm = (path: string) => {
    console.log("$ rm -rf", path)
    rmdirSync(path)
}

export const sh = (command: string) => {
    console.log("$", command)
    execSync(command, { encoding: "utf8", stdio: "inherit" })
}

export const stdoutOf = (command: string) => {
    console.log("$", command, "> self")
    return execSync(
        command,
        { encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] },
    )
        .trim()
}
