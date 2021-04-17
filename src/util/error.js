export function handleError (err)
{
    logError(err)
}

function logError (err)
{
    console.error(err)
}

export function logWarn (msg)
{
    console.log(msg)
}