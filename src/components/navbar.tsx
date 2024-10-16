import { Navbar, NavbarBrand, NavbarContent, NavbarItem, } from "@nextui-org/navbar";
import { Link } from "@nextui-org/react";


export default function Navigation() {


    return (
        <Navbar shouldHideOnScroll>
            <NavbarBrand>

                <p className="font-bold text-inherit">Create Task</p>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem >
                    <Link color="foreground" target="blank" href="https://www.amb.gov.co/portal-ninos-deberes-y-derechos/" >
                        Deberes
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" target="blank" href="https://www.nestleporninossaludables.co/blog/articulo/horarios-actividades-nino">
                        Tareas diarias
                    </Link>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">

            </NavbarContent>
        </Navbar>
    );
}