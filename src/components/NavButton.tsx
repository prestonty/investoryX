import Link from "next/link";

export default function NavButton(props) {
    return (
        <Link
            className={"rounded-[30px] border-2" + " " + props.className}
            href={props.route}
        >
            {props.text}
        </Link>
    );
}
