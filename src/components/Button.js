import Link from "next/link";

export default function Button(props) {
    return (
        <div className={"rounded-[30px] border-2" + " " + props.className}>
            {props.route != null ? (
                <div>
                    <Link href={props.route}>{props.text}</Link>
                </div>
            ) : (
                <button>{props.text}</button>
            )}
        </div>
    );
}
