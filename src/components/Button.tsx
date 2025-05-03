"use client"


export default function Button(props) {
    return(
        <button className="flex justify-center items-center">
            <p>{props.text}</p>
        </button>
    )

}